import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  Radio,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Send,
  Zap,
  BatteryMedium,
  WifiOff,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassBadge } from '../components/glass/GlassBadge';
import { BlePeerNode } from '../types';
import { meshSimulator, BlePacketTrace } from '../services/meshSimulator';

interface BluetoothDiagnosticsScreenProps {
  bleEnabled: boolean;
  onToggleBle: (enabled: boolean) => void;
  peers: BlePeerNode[];
  onTogglePeerConsent: (peerId: string) => void;
}

export const BluetoothDiagnosticsScreen: React.FC<BluetoothDiagnosticsScreenProps> = ({
  bleEnabled,
  onToggleBle,
  peers,
  onTogglePeerConsent,
}) => {
  const [traces, setTraces] = useState<BlePacketTrace[]>(meshSimulator.getTraces());
  const [isTestBroadcasting, setIsTestBroadcasting] = useState(false);

  useEffect(() => {
    const unsubscribe = meshSimulator.subscribe((event) => {
      if (event.type === 'PACKET' || event.type === 'PEERS_UPDATED') {
        setTraces(meshSimulator.getTraces());
      }
    });
    return unsubscribe;
  }, []);

  const handleTriggerTestBeacon = async () => {
    setIsTestBroadcasting(true);
    meshSimulator.addTrace({
      sourceNodeId: 'LOCAL_DEVICE',
      destNodeId: 'ALL_PEERS',
      packetType: 'ADV_BEACON',
      hopCount: 0,
      bytes: 28,
      description: 'Diagnostic Echo Beacon emitted: Checking RSSI and MTU support across nearby radios',
      status: 'SUCCESS',
    });

    await new Promise((r) => setTimeout(r, 800));

    meshSimulator.addTrace({
      sourceNodeId: 'PEER_SM_8401',
      destNodeId: 'LOCAL_DEVICE',
      packetType: 'GATT_CONNECT',
      hopCount: 1,
      bytes: 64,
      description: 'Peer Pixel 8 (Relay Node) echoed diagnostic ping. RTT: 42ms. RSSI: -58 dBm.',
      status: 'SUCCESS',
    });

    setIsTestBroadcasting(false);
  };

  return (
    <div className="min-h-full px-4 pt-3 pb-24 max-w-lg mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-white">BLE Mesh Radio Diagnostics</h1>
          <p className="text-xs text-slate-400">
            Hardware status, physical peers & live GATT packet tracer
          </p>
        </div>
        <button
          onClick={() => onToggleBle(!bleEnabled)}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
            bleEnabled
              ? 'bg-blue-600/80 text-white border-blue-400/50 shadow-md'
              : 'bg-red-950/60 text-red-300 border-red-500/40'
          }`}
        >
          {bleEnabled ? 'Radio ON' : 'Radio OFF'}
        </button>
      </div>

      {/* Hardware Status Banner */}
      <GlassCard glow="blue" className="p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bluetooth className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold text-white">Android BLE Adapter Core</span>
          </div>
          <GlassBadge
            label={bleEnabled ? 'Scanning & Advertising' : 'Hardware Disabled'}
            variant={bleEnabled ? 'success' : 'danger'}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-slate-300">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10 text-center">
            <span className="text-slate-400 text-[10px] block">Service UUID</span>
            <span className="text-blue-300 font-bold">0xFE2C</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10 text-center">
            <span className="text-slate-400 text-[10px] block">Max MTU</span>
            <span className="text-pink-300 font-bold">512 Bytes</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10 text-center">
            <span className="text-slate-400 text-[10px] block">Max Mesh Hops</span>
            <span className="text-emerald-300 font-bold">3 Hops</span>
          </div>
        </div>
      </GlassCard>

      {/* Discovered Peer Nodes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-pink-400" /> Nearby Discovered Mesh Nodes ({peers.length})
          </h2>
          <span className="text-[10px] text-slate-400">Click to toggle relay consent</span>
        </div>

        <div className="space-y-2.5">
          {peers.map((peer) => (
            <GlassCard key={peer.nodeId} glow="none" className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{peer.deviceName}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-white/10 px-1.5 py-0.5 rounded">
                      {peer.nodeId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      Signal: <strong className="text-blue-300">{peer.rssi} dBm</strong>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" /> {peer.batteryPercent}%
                    </span>
                    <span>·</span>
                    <span className="text-slate-400 capitalize">
                      {peer.role.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onTogglePeerConsent(peer.nodeId)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border transition-all ${
                    peer.isRelayConsented
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  }`}
                >
                  {peer.isRelayConsented ? 'Relay Active' : 'Relay Muted'}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Packet Inspection Trace Console */}
      <GlassCard glow="none" className="p-3.5 space-y-2.5 bg-black/60 border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-white font-mono uppercase">
              Live BLE Air Packet Log
            </h2>
          </div>
          <button
            onClick={handleTriggerTestBeacon}
            disabled={isTestBroadcasting || !bleEnabled}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/30 flex items-center gap-1 active:scale-95 transition-all"
          >
            <Zap className="w-3 h-3 text-pink-400" />
            <span>Emit Test Ping</span>
          </button>
        </div>

        <div className="h-44 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px] select-text">
          {traces.map((trace) => (
            <div
              key={trace.id}
              className={`p-2 rounded-lg border leading-tight ${
                trace.status === 'SUCCESS'
                  ? 'bg-slate-900/70 border-blue-400/15 text-slate-300'
                  : 'bg-red-950/40 border-red-500/20 text-red-300'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] text-slate-400 pb-0.5">
                <span className="text-pink-300 font-bold">{trace.packetType}</span>
                <span>{new Date(trace.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-slate-200 mt-0.5">{trace.description}</p>
              <div className="flex items-center gap-2 text-[9px] text-slate-500 mt-1">
                <span>From: {trace.sourceNodeId}</span>
                <span>→</span>
                <span>To: {trace.destNodeId}</span>
                <span>·</span>
                <span>Bytes: {trace.bytes}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
