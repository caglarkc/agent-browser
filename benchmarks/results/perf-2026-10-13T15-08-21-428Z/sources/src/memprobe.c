#include <stdio.h>
#include <stdlib.h>
#include <libproc.h>
#include <sys/resource.h>

int main(int argc, char **argv) {
    printf("{");
    int emitted = 0;
    for (int i=1; i<argc; i++) {
        pid_t pid=(pid_t)strtol(argv[i],NULL,10);
        struct rusage_info_v4 info={0};
        if (pid<=0 || proc_pid_rusage(pid,RUSAGE_INFO_V4,(rusage_info_t *)&info)!=0) continue;
        if (emitted++) printf(",");
        printf("\"%d\":{\"footprintBytes\":%llu,\"lifetimePeakBytes\":%llu,\"userNs\":%llu,\"systemNs\":%llu}",
               pid,(unsigned long long)info.ri_phys_footprint,
               (unsigned long long)info.ri_lifetime_max_phys_footprint,
               (unsigned long long)info.ri_user_time,(unsigned long long)info.ri_system_time);
    }
    printf("}\n");
    return 0;
}
