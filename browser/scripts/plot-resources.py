"""Optional offline plots: python plot-resources.py <published-run> <output-dir>.

Requires matplotlib in the analysis environment, not in the browser runtime.
"""
import json
import sys
import hashlib
import platform
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

source, destination = map(Path, sys.argv[1:3])
destination.mkdir(parents=True, exist_ok=True)
results = json.loads((source / 'results.json').read_text())
manifest = json.loads((source / 'manifest.json').read_text())
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10,
                     'axes.spines.top': False, 'axes.spines.right': False,
                     'axes.titleweight': 'bold', 'savefig.facecolor': 'white'})
names = list(dict.fromkeys(r['config']['name'] for r in results))
fig, axes = plt.subplots(1, 2, figsize=(13, 8), sharey=True,
                         gridspec_kw={'width_ratios': [1.2, 1]})
for panel, (metric, color, title, xlabel) in enumerate([
    ('memory', '#2879a8', 'Physical memory', 'MiB (product physical footprint)'),
    ('cpu', '#b46426', 'CPU time', '% of one logical core (100% = 1 core)'),
]):
    ax = axes[panel]
    for i, name in enumerate(names):
        rows = [r for r in results if r['config']['name'] == name]
        values = [(r['phases']['sustained']['product']['footprintBytes']['median'] / 2**20
                   if metric == 'memory' else
                   r['phases']['sustained']['product']['cpuTimeWeightedPercent']) for r in rows]
        value = sum(values) / len(values)
        ax.barh(i, value, color=color, alpha=.86, height=.65)
        ax.errorbar(value, i, xerr=[[value-min(values)], [max(values)-value]],
                    fmt='none', ecolor='#202d38', capsize=3)
        ax.annotate(f'{value:.1f}', (value, i), xytext=(6, 0),
                    textcoords='offset points', va='center', fontsize=9)
    ax.set_title(title, loc='left', pad=14)
    ax.set_xlabel(xlabel)
    ax.set_axisbelow(True)
    ax.grid(axis='x', alpha=.17)
    ax.set_xlim(0, ax.get_xlim()[1]*1.16)
axes[0].set_yticks(range(len(names)), names)
axes[0].invert_yaxis()
fig.suptitle('A1 · Native browser resource diagnostics', x=.025, ha='left', fontsize=17, weight='bold')
fig.text(.025, .035, 'Bars: mean of two run medians (RAM) / weighted CPU means. Whiskers: run range, not confidence intervals.\n'
         'Fresh host each run; product includes measurement host + native workers. Soak has one 600 s run.\n'
         f"{manifest['machine']['cpu']} · {manifest['machine']['logicalCores']} logical cores · synthetic local HTTP workloads", fontsize=9, color='#41515d')
fig.tight_layout(rect=[0, .10, 1, .94])
fig.savefig(destination / 'overview.png', dpi=160)
plt.close(fig)

samples = json.loads((source/'soak-4p8t-r1/samples.json').read_text())
samples = [s for s in samples if s['phase'] == 'sustained']
minutes = [(s['at']-samples[0]['at'])/60000 for s in samples]
fig, axes = plt.subplots(3, 1, figsize=(13, 9), sharex=True)
for group, label, color in [('product', 'Product', '#2879a8'), ('workers', 'Native workers', '#26856d'), ('driver', 'Host + measurement records', '#b46426')]:
    axes[0].plot(minutes, [s[group]['footprintBytes']/2**20 for s in samples], label=label, color=color, linewidth=1.3)
for group, label, color in [('product', 'Product', '#2879a8'), ('workers', 'Native workers', '#26856d')]:
    axes[1].plot(minutes, [s[group]['cpuOneCorePercent'] for s in samples], label=label, color=color, linewidth=1)
axes[2].plot(minutes, [s['workers']['fds'] for s in samples], label='Worker file descriptors', color='#26856d')
axes[2].plot(minutes, [s['workers']['threads'] for s in samples], label='Worker threads', color='#b46426', linestyle='--')
axes[0].set_ylabel('Physical footprint · MiB')
axes[1].set_ylabel('CPU · % of one core')
axes[2].set_ylabel('Count')
axes[2].set_xlabel('Elapsed sustained time · minutes')
for ax in axes:
    ax.grid(alpha=.17)
    ax.legend(loc='upper right', fontsize=9)
    ax.set_ylim(bottom=0)
fig.suptitle('A1 · 4 profiles × 8 real tabs · 600 s soak', x=.025, ha='left', fontsize=17, weight='bold')
fig.text(.025, .025, '1 s samples. Active JS + local fetch; inspect every 5 s; reload every 30 s.\n'
         'Host retains measurement records; its memory trend is not proof of an engine leak. CPU 100% = one logical core.', fontsize=9, color='#41515d')
fig.tight_layout(rect=[0, .075, 1, .94])
fig.savefig(destination / 'soak.png', dpi=160)
plt.close(fig)

network = source/'followups/network'
if (network/'results.json').exists():
    fig, ax = plt.subplots(figsize=(12, 5.5))
    for name, label, color in [
        ('default-reload', 'Default capture · reload every 30 s', '#b46426'),
        ('default-continuous', 'Default capture · no reload', '#b64242'),
        ('zero-capture-continuous', 'Zero capture budget · no reload', '#26856d'),
    ]:
        data = json.loads((network/(name+'-samples.json')).read_text())
        x = [(s['at']-data[0]['at'])/1000 for s in data]
        y = [s['workers']['footprintBytes']/2**20 for s in data]
        ax.plot(x, y, label=label, color=color, linewidth=2)
    ax.set_xlabel('Elapsed measurement time · seconds')
    ax.set_ylabel('Native worker physical footprint · MiB')
    ax.set_title('A1 · Network memory retention · controlled follow-up', loc='left', pad=18, fontsize=16)
    ax.grid(alpha=.17)
    ax.set_ylim(bottom=0)
    ax.legend(fontsize=10)
    fig.text(.025, .025, 'One verified native worker, 10 real tabs, 64 KiB fetch / 250 ms / tab. Fresh worker each condition.\n'
             'Capture policy changes only this diagnostic; product defaults remain unchanged. One run per condition.', fontsize=9, color='#41515d')
    fig.tight_layout(rect=[0, .09, 1, 1])
    fig.savefig(destination/'network-memory.png', dpi=160)
    plt.close(fig)

digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
(destination/'plots.json').write_text(json.dumps({
    'runId': manifest['runId'], 'python': platform.python_version(),
    'matplotlib': matplotlib.__version__, 'scriptSha256': digest(Path(__file__)),
    'runManifestSha256': digest(source/'manifest.json'),
    'plots': {p.name: digest(p) for p in sorted(destination.glob('*.png'))},
}, indent=2)+'\n')
print(destination)
