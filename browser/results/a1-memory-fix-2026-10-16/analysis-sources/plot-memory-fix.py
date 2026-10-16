"""Standalone evidence figure. Requires matplotlib (recorded version in output)."""
import json
import sys
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

root, baseline = map(Path, sys.argv[1:3])
load = lambda p: json.loads(p.read_text())
fig, axes = plt.subplots(1, 2, figsize=(11.5, 4), layout='constrained')
colors = {'old':'#b94736','fixed':'#116b8a','zero':'#47823e'}
for folder,name,label,color in [
    (baseline,'default-continuous','Previous default (120 s)',colors['old']),
    (root/'network-120','default-continuous','Fixed default (120 s)',colors['fixed']),
    (root/'network-120','zero-capture-continuous','Fixed zero capture (120 s)',colors['zero'])]:
    samples = load(folder/(name+'-samples.json'))
    axes[0].plot([(s['monotonicMs']-samples[0]['monotonicMs'])/1000 for s in samples],
                 [s['workers']['footprintBytes']/2**20 for s in samples],label=label,color=color,lw=1.8)
samples=load(root/'network-600/default-continuous-samples.json')
axes[1].plot([(s['monotonicMs']-samples[0]['monotonicMs'])/1000 for s in samples],
             [s['workers']['footprintBytes']/2**20 for s in samples],label='Fixed default (600 s)',color=colors['fixed'],lw=1.8)
for ax,title in zip(axes,['Same network workload: before / after','Fixed engine: continuous load, no reload']):
    ax.set_title(title,fontsize=10);ax.set_xlabel('Elapsed time (seconds)');ax.set_ylabel('Native physical footprint (MiB)')
    ax.set_ylim(bottom=0);ax.grid(alpha=.2);ax.legend(fontsize=8,loc='upper left')
fig.suptitle('One worker, 10 native tabs; 64 KiB fetch / 250 ms / tab',fontsize=12)
fig.savefig(root/'memory-comparison.svg',metadata={'Creator':'matplotlib '+matplotlib.__version__})
fig.savefig(root/'memory-comparison.png',dpi=150)
print('matplotlib',matplotlib.__version__)
