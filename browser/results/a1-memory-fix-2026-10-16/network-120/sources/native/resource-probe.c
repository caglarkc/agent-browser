#include <stdio.h>
#include <stdlib.h>
#include <libproc.h>
#include <sys/resource.h>
#include <sys/sysctl.h>
#include <mach/mach.h>
#include <mach/mach_time.h>

static mach_timebase_info_data_t timebase;
static unsigned long long ns(uint64_t ticks) {
    return (unsigned long long)((__uint128_t)ticks * timebase.numer / timebase.denom);
}

int main(int argc, char **argv) {
    if (mach_timebase_info(&timebase) != KERN_SUCCESS || !timebase.denom) return 1;
    printf("{\"processes\":{");
    int emitted = 0;
    for (int i = 1; i < argc; i++) {
        pid_t pid = (pid_t)strtol(argv[i], NULL, 10);
        struct rusage_info_v4 r = {0};
        struct proc_taskinfo t = {0};
        if (pid <= 0 || proc_pid_rusage(pid, RUSAGE_INFO_V4, (rusage_info_t *)&r)) continue;
        int task = proc_pidinfo(pid, PROC_PIDTASKINFO, 0, &t, sizeof(t));
        int size = proc_pidinfo(pid, PROC_PIDLISTFDS, 0, NULL, 0);
        int fds = -1, sockets = -1;
        if (size > 0) {
            struct proc_fdinfo *list = malloc((size_t)size + 32 * sizeof(*list));
            if (list) {
                int bytes = proc_pidinfo(pid, PROC_PIDLISTFDS, 0, list, size + 32 * (int)sizeof(*list));
                if (bytes > 0) {
                    fds = bytes / (int)sizeof(*list); sockets = 0;
                    for (int j = 0; j < fds; j++) if (list[j].proc_fdtype == PROX_FDTYPE_SOCKET) sockets++;
                }
                free(list);
            }
        }
        if (emitted++) printf(",");
        // start identity is a string to avoid loss of 64-bit integer precision in JSON consumers.
        printf("\"%d\":{\"startId\":\"%llu\",\"footprintBytes\":%llu,\"rssBytes\":%llu,\"lifetimePeakBytes\":%llu,\"userNs\":%llu,\"systemNs\":%llu,\"diskReadBytes\":%llu,\"diskWriteBytes\":%llu,\"logicalWriteBytes\":%llu,\"pageins\":%llu,\"idleWakeups\":%llu,\"interruptWakeups\":%llu,\"threads\":%d,\"faults\":%d,\"contextSwitches\":%d,\"fds\":%d,\"sockets\":%d}",
            pid, (unsigned long long)r.ri_proc_start_abstime,
            (unsigned long long)r.ri_phys_footprint, (unsigned long long)r.ri_resident_size,
            (unsigned long long)r.ri_lifetime_max_phys_footprint,
            ns(r.ri_user_time), ns(r.ri_system_time),
            (unsigned long long)r.ri_diskio_bytesread, (unsigned long long)r.ri_diskio_byteswritten,
            (unsigned long long)r.ri_logical_writes, (unsigned long long)r.ri_pageins,
            (unsigned long long)r.ri_pkg_idle_wkups, (unsigned long long)r.ri_interrupt_wkups,
            task == sizeof(t) ? t.pti_threadnum : -1, task == sizeof(t) ? t.pti_faults : -1,
            task == sizeof(t) ? t.pti_csw : -1, fds, sockets);
    }
    printf("},\"system\":{\"timebaseNumer\":%u,\"timebaseDenom\":%u,", timebase.numer, timebase.denom);
    vm_statistics64_data_t v = {0}; mach_msg_type_number_t count = HOST_VM_INFO64_COUNT;
    vm_size_t page = 0; host_page_size(mach_host_self(), &page);
    if (host_statistics64(mach_host_self(), HOST_VM_INFO64, (host_info64_t)&v, &count) == KERN_SUCCESS) {
        printf("\"pageSize\":%lu,\"freeBytes\":%llu,\"inactiveBytes\":%llu,\"compressorBytes\":%llu,\"compressionsTotal\":%llu,\"swapins\":%llu,\"swapouts\":%llu,\"pageins\":%llu,\"pageouts\":%llu,",
            page, (unsigned long long)v.free_count * page, (unsigned long long)v.inactive_count * page,
            (unsigned long long)v.compressor_page_count * page, (unsigned long long)v.compressions,
            (unsigned long long)v.swapins, (unsigned long long)v.swapouts,
            (unsigned long long)v.pageins, (unsigned long long)v.pageouts);
    }
    struct xsw_usage swap = {0}; size_t size = sizeof(swap);
    if (!sysctlbyname("vm.swapusage", &swap, &size, NULL, 0)) printf("\"swapUsedBytes\":%llu,", (unsigned long long)swap.xsu_used);
    host_cpu_load_info_data_t cpu; count = HOST_CPU_LOAD_INFO_COUNT;
    if (host_statistics(mach_host_self(), HOST_CPU_LOAD_INFO, (host_info_t)&cpu, &count) == KERN_SUCCESS)
        printf("\"cpuTicks\":[%u,%u,%u,%u],", cpu.cpu_ticks[0], cpu.cpu_ticks[1], cpu.cpu_ticks[2], cpu.cpu_ticks[3]);
    int pressure = -1; size = sizeof(pressure);
    sysctlbyname("kern.memorystatus_vm_pressure_level", &pressure, &size, NULL, 0);
    printf("\"pressureLevel\":%d}}\n", pressure);
    return 0;
}
