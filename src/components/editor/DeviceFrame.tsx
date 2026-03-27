"use client";

import React from "react";
import { DEVICE_LIST } from "@/lib/deviceConfigs";
import { cn } from "@/lib/utils";

interface DevicePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (deviceId: string) => void;
  currentDevice: string;
}

export default function DevicePicker({
  isOpen,
  onClose,
  onSelect,
  currentDevice,
}: DevicePickerProps) {
  if (!isOpen) return null;

  const categories = {
    ios: DEVICE_LIST.filter((d) => d.category === "ios"),
    android: DEVICE_LIST.filter((d) => d.category === "android"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold">Choose Device</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-sm"
          >
            Close
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {Object.entries(categories).map(([cat, devices]) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                {cat === "ios" ? "iOS" : "Android"}
              </h3>
              <div className="flex flex-col gap-1">
                {devices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => {
                      onSelect(device.id);
                      onClose();
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                      device.id === currentDevice
                        ? "bg-accent/20 text-accent border border-accent/30"
                        : "hover:bg-white/5 text-foreground"
                    )}
                  >
                    <span>{device.name}</span>
                    <span className="text-xs text-muted">
                      {device.exportWidth}×{device.exportHeight}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
