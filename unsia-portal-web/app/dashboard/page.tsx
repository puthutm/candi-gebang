'use client';

import React from 'react';

export default function DashboardOverview() {
  const stats = [
    { title: 'Total Leads Terkumpul', value: '1,482', change: '+12.5%', type: 'up' },
    { title: 'Pendaftar Terverifikasi', value: '385', change: '+8.3%', type: 'up' },
    { title: 'Invoice Lunas (Registration)', value: 'IDR 96.2M', change: '+22.1%', type: 'up' },
    { title: 'Mahasiswa Onboarded', value: '294', change: '+14.2%', type: 'up' },
  ];

  const integrationServices = [
    { name: 'Core IAM Service', status: 'ONLINE', port: '3001', latency: '4ms' },
    { name: 'Reference Master Data', status: 'ONLINE', port: '3002', latency: '2ms' },
    { name: 'CRM & Leads Service', status: 'ONLINE', port: '3003', latency: '8ms' },
    { name: 'PMB Admission Service', status: 'ONLINE', port: '3004', latency: '5ms' },
    { name: 'Finance Clearance Service', status: 'ONLINE', port: '3005', latency: '12ms' },
    { name: 'Academic SIAKAD Service', status: 'ONLINE', port: '3006', latency: '6ms' },
    { name: 'HRIS Kepegawaian', status: 'ONLINE', port: '3007', latency: '4ms' },
    { name: 'LMS E-Learning Service', status: 'ONLINE', port: '3008', latency: '9ms' },
    { name: 'Assessment CBT Service', status: 'ONLINE', port: '3009', latency: '7ms' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h2>
        <p className="text-slate-400 mt-1">Real-time modular status and metrics monitor.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-xl backdrop-blur-sm relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300">
            <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-300"></div>
            <p className="text-sm font-medium text-slate-400">{stat.title}</p>
            <div className="flex items-baseline justify-between mt-4">
              <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Services Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-slate-200">Modular Microservices Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrationServices.map((service) => (
            <div key={service.name} className="p-5 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between hover:border-slate-800 transition-all duration-200">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">{service.name}</h4>
                <p className="text-xs text-slate-500">Port: {service.port} • Latency: {service.latency}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-400">{service.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
