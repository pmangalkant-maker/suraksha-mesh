import { EmergencyAlert, BlePeerNode } from '../types';
import { INITIAL_PEER_NODES } from '../data/defaultData';

export interface BlePacketTrace {
  id: string;
  timestamp: number;
  sourceNodeId: string;
  destNodeId: string;
  packetType: 'ADV_BEACON' | 'GATT_CONNECT' | 'PAYLOAD_EXCHANGE' | 'RELAY_FORWARD' | 'ACK_RETURN' | 'ERROR_DROP';
  hopCount: number;
  bytes: number;
  description: string;
  status: 'SUCCESS' | 'WAITING' | 'DROPPED';
}

export type MeshEventListener = (event: {
  type: 'PACKET' | 'ALERT_UPDATED' | 'PEERS_UPDATED';
  packet?: BlePacketTrace;
  alert?: EmergencyAlert;
  peers?: BlePeerNode[];
}) => void;

class MeshSimulator {
  private peers: BlePeerNode[] = [...INITIAL_PEER_NODES];
  private traces: BlePacketTrace[] = [];
  private listeners: MeshEventListener[] = [];
  private isBluetoothActive: boolean = true;
  private isScanning: boolean = true;
  private isAdvertising: boolean = false;
  private duplicateCache: Set<string> = new Set();

  constructor() {
    // Generate initial startup trace
    this.addTrace({
      sourceNodeId: 'LOCAL_DEVICE',
      destNodeId: 'BLE_BROADCAST',
      packetType: 'ADV_BEACON',
      hopCount: 0,
      bytes: 28,
      description: 'BLE Advertisement started: Service UUID 0000FE2C-0000-1000-8000-00805F9B34FB',
      status: 'SUCCESS',
    });
  }

  subscribe(listener: MeshEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(data: {
    type: 'PACKET' | 'ALERT_UPDATED' | 'PEERS_UPDATED';
    packet?: BlePacketTrace;
    alert?: EmergencyAlert;
    peers?: BlePeerNode[];
  }) {
    this.listeners.forEach((l) => l(data));
  }

  getPeers(): BlePeerNode[] {
    return [...this.peers];
  }

  getTraces(): BlePacketTrace[] {
    return [...this.traces];
  }

  isBleEnabled(): boolean {
    return this.isBluetoothActive;
  }

  setBleEnabled(enabled: boolean) {
    this.isBluetoothActive = enabled;
    this.addTrace({
      sourceNodeId: 'LOCAL_DEVICE',
      destNodeId: 'SYSTEM',
      packetType: enabled ? 'ADV_BEACON' : 'ERROR_DROP',
      hopCount: 0,
      bytes: 0,
      description: enabled
        ? 'Bluetooth Adapter Enabled: Re-binding GATT Server & Scanner'
        : 'Bluetooth Adapter Disabled by user: All BLE scans and advertisements halted',
      status: enabled ? 'SUCCESS' : 'DROPPED',
    });
    this.notify({ type: 'PEERS_UPDATED', peers: this.peers });
  }

  togglePeerRelayConsent(peerId: string) {
    this.peers = this.peers.map((p) =>
      p.nodeId === peerId ? { ...p, isRelayConsented: !p.isRelayConsented } : p
    );
    this.notify({ type: 'PEERS_UPDATED', peers: this.peers });
  }

  addTrace(traceData: Omit<BlePacketTrace, 'id' | 'timestamp'>) {
    const trace: BlePacketTrace = {
      ...traceData,
      id: `trace-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
    };
    this.traces = [trace, ...this.traces.slice(0, 99)];
    this.notify({ type: 'PACKET', packet: trace });
  }

  /**
   * Simulates full multi-hop transmission for an emergency alert
   */
  async transmitSosAlert(
    alert: EmergencyAlert,
    onStatusChange: (updated: EmergencyAlert) => void
  ) {
    if (!this.isBluetoothActive) {
      const failedAlert: EmergencyAlert = {
        ...alert,
        status: 'STORED_LOCALLY',
        statusMessage: 'Bluetooth is turned OFF. Alert stored safely in local database.',
      };
      onStatusChange(failedAlert);
      return;
    }

    // Step 1: Stored locally & start BLE advertising
    this.isAdvertising = true;
    let currentAlert: EmergencyAlert = {
      ...alert,
      status: 'BLE_BROADCASTING',
      statusMessage: 'Broadcasting 128-bit Suraksha Mesh Emergency Service UUID via BLE Advertiser...',
    };
    onStatusChange(currentAlert);

    this.addTrace({
      sourceNodeId: 'PHONE_A (Victim)',
      destNodeId: '0xFF:BROADCAST',
      packetType: 'ADV_BEACON',
      hopCount: 0,
      bytes: 31,
      description: `SurakshaMesh beacon emitted. AlertId: ${alert.alertId.slice(0, 8)}... Type: ${alert.emergencyType}`,
      status: 'SUCCESS',
    });

    await new Promise((r) => setTimeout(r, 1200));

    // Step 2: Discovery by Phone B (Passing Relay Node)
    const relayNode = this.peers.find((p) => p.role === 'PASSING_RELAY_PHONE' && p.isRelayConsented);
    if (!relayNode) {
      currentAlert = {
        ...currentAlert,
        status: 'STORED_LOCALLY',
        statusMessage:
          'No compatible peer with relay consent within BLE range (~20m). Alert persists in Room DB and will retry upon device discovery.',
      };
      onStatusChange(currentAlert);
      this.addTrace({
        sourceNodeId: 'PHONE_A (Victim)',
        destNodeId: 'MESH_AIR',
        packetType: 'ERROR_DROP',
        hopCount: 0,
        bytes: 0,
        description: 'Scan cycle completed: 0 peers accepted GATT connection request.',
        status: 'DROPPED',
      });
      return;
    }

    // Connect GATT to Relay Node
    this.addTrace({
      sourceNodeId: 'PHONE_A (Victim)',
      destNodeId: `${relayNode.deviceName} [${relayNode.nodeId}]`,
      packetType: 'GATT_CONNECT',
      hopCount: 1,
      bytes: 512,
      description: `GATT connection established. MTU negotiated: 512 bytes. Transmitting encrypted SOS payload + GPS metadata.`,
      status: 'SUCCESS',
    });

    currentAlert = {
      ...currentAlert,
      status: 'NEARBY_DEVICE_RECEIVED',
      hopCount: 1,
      statusMessage: `Payload delivered to nearby Android device (${relayNode.deviceName}, RSSI: ${relayNode.rssi} dBm).`,
      relayHistory: [
        ...currentAlert.relayHistory,
        {
          nodeId: relayNode.nodeId,
          nodeName: relayNode.deviceName,
          timestamp: Date.now(),
          hop: 1,
          batteryLevel: relayNode.batteryPercent,
        },
      ],
    };
    onStatusChange(currentAlert);

    await new Promise((r) => setTimeout(r, 2000));

    // Step 3: Multi-hop forwarding from Phone B to Phone C (Safe Haven / Helper Desk)
    const helperNode = this.peers.find((p) => p.role === 'SAFE_HAVEN_HELPER');
    if (helperNode && currentAlert.hopCount < currentAlert.maxHops) {
      this.addTrace({
        sourceNodeId: `${relayNode.deviceName}`,
        destNodeId: `${helperNode.deviceName}`,
        packetType: 'RELAY_FORWARD',
        hopCount: 2,
        bytes: 512,
        description: `Hop 2 Forwarding: Verified signature, loop detection passed, alert forwarded to Safe Haven terminal.`,
        status: 'SUCCESS',
      });

      currentAlert = {
        ...currentAlert,
        status: 'RELAYED_HOP_2',
        hopCount: 2,
        statusMessage: `Forwarded via mesh hop 2 to ${helperNode.deviceName}. Reached verified Safe Haven desk.`,
        relayHistory: [
          ...currentAlert.relayHistory,
          {
            nodeId: helperNode.nodeId,
            nodeName: helperNode.deviceName,
            timestamp: Date.now(),
            hop: 2,
            batteryLevel: helperNode.batteryPercent,
          },
        ],
      };
      onStatusChange(currentAlert);

      await new Promise((r) => setTimeout(r, 2200));

      // Step 4: Safe Haven Helper Explicitly Acknowledges SOS
      this.addTrace({
        sourceNodeId: `${helperNode.deviceName}`,
        destNodeId: 'PHONE_A (Victim via Return BLE Route)',
        packetType: 'ACK_RETURN',
        hopCount: 2,
        bytes: 64,
        description: `ACK packet signed by Safe Haven Helper (${helperNode.deviceName}). Return routing successful.`,
        status: 'SUCCESS',
      });

      currentAlert = {
        ...currentAlert,
        status: 'HELPER_ACKNOWLEDGED',
        statusMessage: `VERIFIED ACKNOWLEDGEMENT: ${helperNode.deviceName} acknowledged alert. Staff/security alerted.`,
        acknowledgedBy: {
          helperId: helperNode.nodeId,
          helperName: 'Pink Booth Duty Officer #412',
          ackTimestamp: Date.now(),
          estimatedDistanceMeters: 420,
          note: 'Assistance team notified. Maintain safety or head towards illuminated Safe Haven post.',
        },
      };
      onStatusChange(currentAlert);
    }
  }

  /**
   * Helper manually acknowledges an incoming alert
   */
  acknowledgeIncomingAlert(alert: EmergencyAlert, helperName: string): EmergencyAlert {
    const updated: EmergencyAlert = {
      ...alert,
      status: 'HELPER_ACKNOWLEDGED',
      statusMessage: `Alert acknowledged by ${helperName}. Transmission confirmation dispatched back through BLE return path.`,
      acknowledgedBy: {
        helperId: 'LOCAL_HELPER_DEVICE',
        helperName,
        ackTimestamp: Date.now(),
        estimatedDistanceMeters: 310,
        note: 'Helper actively responding and tracking alert.',
      },
    };

    this.addTrace({
      sourceNodeId: 'LOCAL_HELPER_DEVICE',
      destNodeId: alert.senderId,
      packetType: 'ACK_RETURN',
      hopCount: alert.hopCount,
      bytes: 64,
      description: `Manual acknowledgement dispatched by ${helperName}. Return delivery verified.`,
      status: 'SUCCESS',
    });

    return updated;
  }
}

export const meshSimulator = new MeshSimulator();
