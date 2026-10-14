# Browser lab run
Policy: jev. Paid API calls: 1745.
Results: 424 PASS, 96 FAIL, 40 UNSUPPORTED.

| Task | Profile | Status | Total ms | Calls | Reason |
|---|---|---|---:|---:|---|
| read | chromium-rendered | PASS | 1366 | 1 |  |
| read | chromium-semantic | PASS | 973 | 1 |  |
| read | lightpanda-semantic | PASS | 591 | 1 |  |
| read | lightpanda-enhanced | PASS | 513 | 1 |  |
| form | chromium-rendered | FAIL | 933 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| form | chromium-semantic | FAIL | 972 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| form | lightpanda-semantic | FAIL | 570 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| form | lightpanda-enhanced | FAIL | 528 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| upload | chromium-rendered | PASS | 1749 | 3 |  |
| upload | chromium-semantic | PASS | 2051 | 3 |  |
| upload | lightpanda-semantic | PASS | 1279 | 3 |  |
| upload | lightpanda-enhanced | PASS | 1505 | 3 |  |
| menu | chromium-rendered | PASS | 2704 | 5 |  |
| menu | chromium-semantic | PASS | 2539 | 5 |  |
| menu | lightpanda-semantic | PASS | 2091 | 5 |  |
| menu | lightpanda-enhanced | PASS | 2080 | 5 |  |
| overlay | chromium-rendered | PASS | 1769 | 3 |  |
| overlay | chromium-semantic | PASS | 1766 | 3 |  |
| overlay | lightpanda-semantic | PASS | 1409 | 3 |  |
| overlay | lightpanda-enhanced | PASS | 1383 | 3 |  |
| lazy | chromium-rendered | PASS | 1760 | 3 |  |
| lazy | chromium-semantic | PASS | 1783 | 3 |  |
| lazy | lightpanda-semantic | PASS | 919 | 2 |  |
| lazy | lightpanda-enhanced | PASS | 931 | 2 |  |
| shadow | chromium-rendered | PASS | 1403 | 2 |  |
| shadow | chromium-semantic | PASS | 1474 | 2 |  |
| shadow | lightpanda-semantic | PASS | 904 | 2 |  |
| shadow | lightpanda-enhanced | PASS | 893 | 2 |  |
| iframe | chromium-rendered | PASS | 1529 | 2 |  |
| iframe | chromium-semantic | PASS | 1524 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 537 | 1 | Policy returned BLOCKED |
| iframe | lightpanda-enhanced | FAIL | 558 | 1 | Policy returned BLOCKED |
| css-hidden | chromium-rendered | PASS | 1645 | 2 |  |
| css-hidden | chromium-semantic | PASS | 1520 | 2 |  |
| css-hidden | lightpanda-semantic | PASS | 900 | 2 |  |
| css-hidden | lightpanda-enhanced | PASS | 964 | 2 |  |
| pointer | chromium-rendered | PASS | 1354 | 2 |  |
| pointer | chromium-semantic | FAIL | 5676 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 5113 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-enhanced | PASS | 989 | 2 |  |
| trusted-pointer | chromium-rendered | PASS | 1420 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 5703 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 5910 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-enhanced | FAIL | 5267 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| autocomplete | chromium-rendered | PASS | 2804 | 4 |  |
| autocomplete | chromium-semantic | PASS | 2910 | 4 |  |
| autocomplete | lightpanda-semantic | PASS | 2342 | 4 |  |
| autocomplete | lightpanda-enhanced | PASS | 2332 | 4 |  |
| records | chromium-rendered | PASS | 1306 | 2 |  |
| records | chromium-semantic | PASS | 1484 | 2 |  |
| records | lightpanda-semantic | PASS | 914 | 2 |  |
| records | lightpanda-enhanced | PASS | 923 | 2 |  |
| canvas | chromium-rendered | UNSUPPORTED | 622 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-semantic | UNSUPPORTED | 595 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 170 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-enhanced | UNSUPPORTED | 172 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| read | chromium-semantic | PASS | 1048 | 1 |  |
| read | lightpanda-semantic | PASS | 505 | 1 |  |
| read | lightpanda-enhanced | PASS | 524 | 1 |  |
| read | chromium-rendered | PASS | 1024 | 1 |  |
| form | chromium-semantic | PASS | 2475 | 4 |  |
| form | lightpanda-semantic | PASS | 1811 | 4 |  |
| form | lightpanda-enhanced | PASS | 1695 | 4 |  |
| form | chromium-rendered | PASS | 2202 | 4 |  |
| upload | chromium-semantic | PASS | 1741 | 3 |  |
| upload | lightpanda-semantic | PASS | 1376 | 3 |  |
| upload | lightpanda-enhanced | PASS | 1357 | 3 |  |
| upload | chromium-rendered | PASS | 1795 | 3 |  |
| menu | chromium-semantic | PASS | 1781 | 3 |  |
| menu | lightpanda-semantic | PASS | 1303 | 3 |  |
| menu | lightpanda-enhanced | PASS | 1667 | 4 |  |
| menu | chromium-rendered | PASS | 2959 | 6 |  |
| overlay | chromium-semantic | PASS | 1848 | 3 |  |
| overlay | lightpanda-semantic | PASS | 1444 | 3 |  |
| overlay | lightpanda-enhanced | PASS | 1389 | 3 |  |
| overlay | chromium-rendered | PASS | 1737 | 3 |  |
| lazy | chromium-semantic | PASS | 2344 | 3 |  |
| lazy | lightpanda-semantic | PASS | 1040 | 2 |  |
| lazy | lightpanda-enhanced | PASS | 964 | 2 |  |
| lazy | chromium-rendered | PASS | 2293 | 3 |  |
| shadow | chromium-semantic | PASS | 1748 | 2 |  |
| shadow | lightpanda-semantic | PASS | 950 | 2 |  |
| shadow | lightpanda-enhanced | PASS | 952 | 2 |  |
| shadow | chromium-rendered | PASS | 1480 | 2 |  |
| iframe | chromium-semantic | PASS | 1425 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 524 | 1 | Policy returned BLOCKED |
| iframe | lightpanda-enhanced | FAIL | 518 | 1 | Policy returned BLOCKED |
| iframe | chromium-rendered | PASS | 1496 | 2 |  |
| css-hidden | chromium-semantic | FAIL | 1365 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-semantic | FAIL | 968 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-enhanced | PASS | 939 | 2 |  |
| css-hidden | chromium-rendered | PASS | 1502 | 2 |  |
| pointer | chromium-semantic | FAIL | 5786 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 4947 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-enhanced | PASS | 934 | 2 |  |
| pointer | chromium-rendered | PASS | 1383 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 5870 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 5380 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-enhanced | FAIL | 5546 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | chromium-rendered | PASS | 1439 | 2 |  |
| autocomplete | chromium-semantic | PASS | 2556 | 4 |  |
| autocomplete | lightpanda-semantic | PASS | 1774 | 4 |  |
| autocomplete | lightpanda-enhanced | PASS | 1813 | 4 |  |
| autocomplete | chromium-rendered | PASS | 2438 | 4 |  |
| records | chromium-semantic | PASS | 1342 | 2 |  |
| records | lightpanda-semantic | PASS | 1004 | 2 |  |
| records | lightpanda-enhanced | PASS | 935 | 2 |  |
| records | chromium-rendered | PASS | 1537 | 2 |  |
| canvas | chromium-semantic | UNSUPPORTED | 507 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 166 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-enhanced | UNSUPPORTED | 169 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-rendered | UNSUPPORTED | 496 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| read | lightpanda-semantic | PASS | 504 | 1 |  |
| read | lightpanda-enhanced | PASS | 557 | 1 |  |
| read | chromium-rendered | PASS | 1008 | 1 |  |
| read | chromium-semantic | PASS | 1099 | 1 |  |
| form | lightpanda-semantic | PASS | 2307 | 5 |  |
| form | lightpanda-enhanced | PASS | 2204 | 5 |  |
| form | chromium-rendered | PASS | 2845 | 5 |  |
| form | chromium-semantic | PASS | 2817 | 5 |  |
| upload | lightpanda-semantic | PASS | 1456 | 3 |  |
| upload | lightpanda-enhanced | PASS | 1360 | 3 |  |
| upload | chromium-rendered | PASS | 1888 | 3 |  |
| upload | chromium-semantic | PASS | 1828 | 3 |  |
| menu | lightpanda-semantic | PASS | 1619 | 4 |  |
| menu | lightpanda-enhanced | PASS | 1754 | 4 |  |
| menu | chromium-rendered | PASS | 2167 | 4 |  |
| menu | chromium-semantic | PASS | 2117 | 4 |  |
| overlay | lightpanda-semantic | PASS | 1437 | 3 |  |
| overlay | lightpanda-enhanced | PASS | 1489 | 3 |  |
| overlay | chromium-rendered | PASS | 1871 | 3 |  |
| overlay | chromium-semantic | PASS | 1882 | 3 |  |
| lazy | lightpanda-semantic | PASS | 900 | 2 |  |
| lazy | lightpanda-enhanced | PASS | 964 | 2 |  |
| lazy | chromium-rendered | PASS | 1728 | 3 |  |
| lazy | chromium-semantic | PASS | 1792 | 3 |  |
| shadow | lightpanda-semantic | PASS | 893 | 2 |  |
| shadow | lightpanda-enhanced | PASS | 1024 | 2 |  |
| shadow | chromium-rendered | PASS | 1321 | 2 |  |
| shadow | chromium-semantic | PASS | 1415 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 504 | 1 | Policy returned BLOCKED |
| iframe | lightpanda-enhanced | FAIL | 526 | 1 | Policy returned BLOCKED |
| iframe | chromium-rendered | PASS | 1464 | 2 |  |
| iframe | chromium-semantic | PASS | 1482 | 2 |  |
| css-hidden | lightpanda-semantic | PASS | 916 | 2 |  |
| css-hidden | lightpanda-enhanced | PASS | 913 | 2 |  |
| css-hidden | chromium-rendered | PASS | 1357 | 2 |  |
| css-hidden | chromium-semantic | PASS | 1469 | 2 |  |
| pointer | lightpanda-semantic | FAIL | 891 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-enhanced | PASS | 891 | 2 |  |
| pointer | chromium-rendered | PASS | 1416 | 2 |  |
| pointer | chromium-semantic | FAIL | 5464 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 956 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-enhanced | FAIL | 5338 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | chromium-rendered | PASS | 1502 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 1392 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| autocomplete | lightpanda-semantic | PASS | 1969 | 4 |  |
| autocomplete | lightpanda-enhanced | PASS | 2022 | 4 |  |
| autocomplete | chromium-rendered | PASS | 2429 | 4 |  |
| autocomplete | chromium-semantic | PASS | 2446 | 4 |  |
| records | lightpanda-semantic | PASS | 894 | 2 |  |
| records | lightpanda-enhanced | PASS | 930 | 2 |  |
| records | chromium-rendered | PASS | 1349 | 2 |  |
| records | chromium-semantic | PASS | 1519 | 2 |  |
| canvas | lightpanda-semantic | UNSUPPORTED | 164 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-enhanced | UNSUPPORTED | 167 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-rendered | UNSUPPORTED | 500 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-semantic | UNSUPPORTED | 505 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| read | lightpanda-enhanced | PASS | 503 | 1 |  |
| read | chromium-rendered | PASS | 876 | 1 |  |
| read | chromium-semantic | PASS | 914 | 1 |  |
| read | lightpanda-semantic | PASS | 505 | 1 |  |
| form | lightpanda-enhanced | FAIL | 987 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| form | chromium-rendered | FAIL | 916 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| form | chromium-semantic | FAIL | 1492 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| form | lightpanda-semantic | FAIL | 560 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| upload | lightpanda-enhanced | PASS | 1359 | 3 |  |
| upload | chromium-rendered | PASS | 1784 | 3 |  |
| upload | chromium-semantic | PASS | 2077 | 3 |  |
| upload | lightpanda-semantic | PASS | 1312 | 3 |  |
| menu | lightpanda-enhanced | PASS | 1694 | 4 |  |
| menu | chromium-rendered | PASS | 2218 | 4 |  |
| menu | chromium-semantic | PASS | 2266 | 4 |  |
| menu | lightpanda-semantic | PASS | 1695 | 4 |  |
| overlay | lightpanda-enhanced | PASS | 1283 | 3 |  |
| overlay | chromium-rendered | PASS | 1830 | 3 |  |
| overlay | chromium-semantic | PASS | 1867 | 3 |  |
| overlay | lightpanda-semantic | PASS | 1334 | 3 |  |
| lazy | lightpanda-enhanced | PASS | 907 | 2 |  |
| lazy | chromium-rendered | PASS | 1862 | 3 |  |
| lazy | chromium-semantic | PASS | 1737 | 3 |  |
| lazy | lightpanda-semantic | PASS | 1034 | 2 |  |
| shadow | lightpanda-enhanced | PASS | 1041 | 2 |  |
| shadow | chromium-rendered | PASS | 1361 | 2 |  |
| shadow | chromium-semantic | PASS | 1406 | 2 |  |
| shadow | lightpanda-semantic | PASS | 917 | 2 |  |
| iframe | lightpanda-enhanced | FAIL | 520 | 1 | Policy returned BLOCKED |
| iframe | chromium-rendered | PASS | 1363 | 2 |  |
| iframe | chromium-semantic | PASS | 1458 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 499 | 1 | Policy returned BLOCKED |
| css-hidden | lightpanda-enhanced | PASS | 925 | 2 |  |
| css-hidden | chromium-rendered | PASS | 1311 | 2 |  |
| css-hidden | chromium-semantic | FAIL | 1325 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-semantic | FAIL | 1036 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-enhanced | PASS | 905 | 2 |  |
| pointer | chromium-rendered | PASS | 1599 | 2 |  |
| pointer | chromium-semantic | FAIL | 5811 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 5133 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-enhanced | FAIL | 5495 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | chromium-rendered | PASS | 1350 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 6150 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 4822 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| autocomplete | lightpanda-enhanced | PASS | 2259 | 4 |  |
| autocomplete | chromium-rendered | PASS | 2679 | 4 |  |
| autocomplete | chromium-semantic | PASS | 2680 | 4 |  |
| autocomplete | lightpanda-semantic | PASS | 2210 | 4 |  |
| records | lightpanda-enhanced | PASS | 1013 | 2 |  |
| records | chromium-rendered | PASS | 1433 | 2 |  |
| records | chromium-semantic | PASS | 1500 | 2 |  |
| records | lightpanda-semantic | PASS | 908 | 2 |  |
| canvas | lightpanda-enhanced | UNSUPPORTED | 165 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-rendered | UNSUPPORTED | 600 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-semantic | UNSUPPORTED | 505 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 165 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| read | chromium-rendered | PASS | 903 | 1 |  |
| read | chromium-semantic | PASS | 972 | 1 |  |
| read | lightpanda-semantic | PASS | 543 | 1 |  |
| read | lightpanda-enhanced | PASS | 508 | 1 |  |
| form | chromium-rendered | PASS | 2687 | 5 |  |
| form | chromium-semantic | PASS | 2507 | 5 |  |
| form | lightpanda-semantic | PASS | 2347 | 5 |  |
| form | lightpanda-enhanced | PASS | 2268 | 5 |  |
| upload | chromium-rendered | PASS | 1777 | 3 |  |
| upload | chromium-semantic | PASS | 1794 | 3 |  |
| upload | lightpanda-semantic | PASS | 1363 | 3 |  |
| upload | lightpanda-enhanced | PASS | 1441 | 3 |  |
| menu | chromium-rendered | PASS | 2673 | 5 |  |
| menu | chromium-semantic | PASS | 2516 | 5 |  |
| menu | lightpanda-semantic | PASS | 1988 | 5 |  |
| menu | lightpanda-enhanced | PASS | 2169 | 5 |  |
| overlay | chromium-rendered | PASS | 1795 | 3 |  |
| overlay | chromium-semantic | PASS | 2313 | 3 |  |
| overlay | lightpanda-semantic | PASS | 1296 | 3 |  |
| overlay | lightpanda-enhanced | PASS | 1448 | 3 |  |
| lazy | chromium-rendered | PASS | 1735 | 3 |  |
| lazy | chromium-semantic | PASS | 1760 | 3 |  |
| lazy | lightpanda-semantic | PASS | 1075 | 2 |  |
| lazy | lightpanda-enhanced | PASS | 945 | 2 |  |
| shadow | chromium-rendered | PASS | 1493 | 2 |  |
| shadow | chromium-semantic | PASS | 1327 | 2 |  |
| shadow | lightpanda-semantic | PASS | 989 | 2 |  |
| shadow | lightpanda-enhanced | PASS | 940 | 2 |  |
| iframe | chromium-rendered | PASS | 1386 | 2 |  |
| iframe | chromium-semantic | PASS | 1523 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 2278 | 6 | Policy returned BLOCKED |
| iframe | lightpanda-enhanced | FAIL | 496 | 1 | Policy returned BLOCKED |
| css-hidden | chromium-rendered | PASS | 1472 | 2 |  |
| css-hidden | chromium-semantic | PASS | 1726 | 2 |  |
| css-hidden | lightpanda-semantic | PASS | 1144 | 2 |  |
| css-hidden | lightpanda-enhanced | PASS | 882 | 2 |  |
| pointer | chromium-rendered | PASS | 1372 | 2 |  |
| pointer | chromium-semantic | FAIL | 5849 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 842 | 2 | Invalid decision probabilities |
| pointer | lightpanda-enhanced | PASS | 957 | 2 |  |
| trusted-pointer | chromium-rendered | PASS | 1407 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 6025 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 3834 | 9 | Invalid decision probabilities |
| trusted-pointer | lightpanda-enhanced | FAIL | 5333 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| autocomplete | chromium-rendered | PASS | 3022 | 4 |  |
| autocomplete | chromium-semantic | PASS | 2832 | 4 |  |
| autocomplete | lightpanda-semantic | PASS | 2393 | 4 |  |
| autocomplete | lightpanda-enhanced | PASS | 2410 | 4 |  |
| records | chromium-rendered | PASS | 1630 | 2 |  |
| records | chromium-semantic | PASS | 1413 | 2 |  |
| records | lightpanda-semantic | PASS | 1062 | 2 |  |
| records | lightpanda-enhanced | PASS | 963 | 2 |  |
| canvas | chromium-rendered | UNSUPPORTED | 531 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-semantic | UNSUPPORTED | 512 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 167 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-enhanced | UNSUPPORTED | 166 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| read | chromium-semantic | PASS | 943 | 1 |  |
| read | lightpanda-semantic | PASS | 507 | 1 |  |
| read | lightpanda-enhanced | PASS | 506 | 1 |  |
| read | chromium-rendered | PASS | 988 | 1 |  |
| form | chromium-semantic | PASS | 2711 | 4 |  |
| form | lightpanda-semantic | PASS | 1838 | 4 |  |
| form | lightpanda-enhanced | PASS | 1799 | 4 |  |
| form | chromium-rendered | PASS | 2992 | 4 |  |
| upload | chromium-semantic | PASS | 1835 | 3 |  |
| upload | lightpanda-semantic | PASS | 1312 | 3 |  |
| upload | lightpanda-enhanced | PASS | 1326 | 3 |  |
| upload | chromium-rendered | PASS | 1850 | 3 |  |
| menu | chromium-semantic | PASS | 1843 | 3 |  |
| menu | lightpanda-semantic | PASS | 1433 | 3 |  |
| menu | lightpanda-enhanced | PASS | 1508 | 3 |  |
| menu | chromium-rendered | PASS | 2031 | 3 |  |
| overlay | chromium-semantic | PASS | 1837 | 3 |  |
| overlay | lightpanda-semantic | PASS | 1405 | 3 |  |
| overlay | lightpanda-enhanced | PASS | 1447 | 3 |  |
| overlay | chromium-rendered | PASS | 1918 | 3 |  |
| lazy | chromium-semantic | PASS | 1955 | 3 |  |
| lazy | lightpanda-semantic | PASS | 1332 | 3 |  |
| lazy | lightpanda-enhanced | PASS | 928 | 2 |  |
| lazy | chromium-rendered | PASS | 1926 | 3 |  |
| shadow | chromium-semantic | PASS | 1365 | 2 |  |
| shadow | lightpanda-semantic | PASS | 945 | 2 |  |
| shadow | lightpanda-enhanced | PASS | 900 | 2 |  |
| shadow | chromium-rendered | PASS | 1514 | 2 |  |
| iframe | chromium-semantic | PASS | 1445 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 569 | 1 | Policy returned BLOCKED |
| iframe | lightpanda-enhanced | FAIL | 559 | 1 | Policy returned BLOCKED |
| iframe | chromium-rendered | PASS | 1423 | 2 |  |
| css-hidden | chromium-semantic | FAIL | 1461 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-semantic | FAIL | 935 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-enhanced | PASS | 903 | 2 |  |
| css-hidden | chromium-rendered | PASS | 1440 | 2 |  |
| pointer | chromium-semantic | FAIL | 5730 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 5171 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-enhanced | PASS | 873 | 2 |  |
| pointer | chromium-rendered | PASS | 1334 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 5624 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 5346 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-enhanced | FAIL | 5462 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | chromium-rendered | PASS | 1480 | 2 |  |
| autocomplete | chromium-semantic | PASS | 2329 | 4 |  |
| autocomplete | lightpanda-semantic | PASS | 1864 | 4 |  |
| autocomplete | lightpanda-enhanced | PASS | 1964 | 4 |  |
| autocomplete | chromium-rendered | PASS | 2343 | 4 |  |
| records | chromium-semantic | PASS | 1784 | 2 |  |
| records | lightpanda-semantic | PASS | 929 | 2 |  |
| records | lightpanda-enhanced | PASS | 893 | 2 |  |
| records | chromium-rendered | PASS | 1633 | 2 |  |
| canvas | chromium-semantic | UNSUPPORTED | 528 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 168 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-enhanced | UNSUPPORTED | 165 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-rendered | UNSUPPORTED | 550 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| read | lightpanda-semantic | PASS | 594 | 1 |  |
| read | lightpanda-enhanced | PASS | 503 | 1 |  |
| read | chromium-rendered | PASS | 1060 | 1 |  |
| read | chromium-semantic | PASS | 1066 | 1 |  |
| form | lightpanda-semantic | FAIL | 560 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| form | lightpanda-enhanced | FAIL | 500 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| form | chromium-rendered | FAIL | 1181 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| form | chromium-semantic | FAIL | 952 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| upload | lightpanda-semantic | PASS | 1361 | 3 |  |
| upload | lightpanda-enhanced | PASS | 1354 | 3 |  |
| upload | chromium-rendered | PASS | 2089 | 3 |  |
| upload | chromium-semantic | PASS | 1733 | 3 |  |
| menu | lightpanda-semantic | PASS | 1657 | 4 |  |
| menu | lightpanda-enhanced | PASS | 2068 | 5 |  |
| menu | chromium-rendered | PASS | 3176 | 7 |  |
| menu | chromium-semantic | PASS | 2185 | 4 |  |
| overlay | lightpanda-semantic | PASS | 1298 | 3 |  |
| overlay | lightpanda-enhanced | PASS | 1374 | 3 |  |
| overlay | chromium-rendered | PASS | 1901 | 3 |  |
| overlay | chromium-semantic | PASS | 1856 | 3 |  |
| lazy | lightpanda-semantic | PASS | 958 | 2 |  |
| lazy | lightpanda-enhanced | PASS | 922 | 2 |  |
| lazy | chromium-rendered | PASS | 1966 | 3 |  |
| lazy | chromium-semantic | PASS | 1798 | 3 |  |
| shadow | lightpanda-semantic | PASS | 1059 | 2 |  |
| shadow | lightpanda-enhanced | PASS | 919 | 2 |  |
| shadow | chromium-rendered | PASS | 1363 | 2 |  |
| shadow | chromium-semantic | PASS | 1544 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 501 | 1 | Policy returned BLOCKED |
| iframe | lightpanda-enhanced | FAIL | 491 | 1 | Policy returned BLOCKED |
| iframe | chromium-rendered | PASS | 1506 | 2 |  |
| iframe | chromium-semantic | PASS | 1564 | 2 |  |
| css-hidden | lightpanda-semantic | PASS | 950 | 2 |  |
| css-hidden | lightpanda-enhanced | PASS | 963 | 2 |  |
| css-hidden | chromium-rendered | PASS | 1714 | 2 |  |
| css-hidden | chromium-semantic | PASS | 1408 | 2 |  |
| pointer | lightpanda-semantic | FAIL | 5214 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-enhanced | PASS | 930 | 2 |  |
| pointer | chromium-rendered | PASS | 1374 | 2 |  |
| pointer | chromium-semantic | FAIL | 6064 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 5272 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-enhanced | FAIL | 5144 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | chromium-rendered | PASS | 1395 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 6156 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| autocomplete | lightpanda-semantic | PASS | 2357 | 4 |  |
| autocomplete | lightpanda-enhanced | PASS | 2088 | 4 |  |
| autocomplete | chromium-rendered | PASS | 2726 | 4 |  |
| autocomplete | chromium-semantic | PASS | 2564 | 4 |  |
| records | lightpanda-semantic | PASS | 1075 | 2 |  |
| records | lightpanda-enhanced | PASS | 955 | 2 |  |
| records | chromium-rendered | PASS | 1396 | 2 |  |
| records | chromium-semantic | PASS | 1381 | 2 |  |
| canvas | lightpanda-semantic | UNSUPPORTED | 166 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-enhanced | UNSUPPORTED | 166 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-rendered | UNSUPPORTED | 500 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-semantic | UNSUPPORTED | 535 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| read | lightpanda-enhanced | PASS | 591 | 1 |  |
| read | chromium-rendered | PASS | 1003 | 1 |  |
| read | chromium-semantic | PASS | 1025 | 1 |  |
| read | lightpanda-semantic | PASS | 523 | 1 |  |
| form | lightpanda-enhanced | PASS | 2298 | 5 |  |
| form | chromium-rendered | PASS | 2687 | 5 |  |
| form | chromium-semantic | PASS | 2733 | 5 |  |
| form | lightpanda-semantic | PASS | 2250 | 5 |  |
| upload | lightpanda-enhanced | PASS | 1452 | 3 |  |
| upload | chromium-rendered | PASS | 1799 | 3 |  |
| upload | chromium-semantic | PASS | 1778 | 3 |  |
| upload | lightpanda-semantic | PASS | 1346 | 3 |  |
| menu | lightpanda-enhanced | PASS | 1878 | 4 |  |
| menu | chromium-rendered | PASS | 2182 | 4 |  |
| menu | chromium-semantic | PASS | 2272 | 4 |  |
| menu | lightpanda-semantic | PASS | 1702 | 4 |  |
| overlay | lightpanda-enhanced | PASS | 1439 | 3 |  |
| overlay | chromium-rendered | PASS | 1809 | 3 |  |
| overlay | chromium-semantic | PASS | 1892 | 3 |  |
| overlay | lightpanda-semantic | PASS | 1333 | 3 |  |
| lazy | lightpanda-enhanced | PASS | 889 | 2 |  |
| lazy | chromium-rendered | PASS | 1951 | 3 |  |
| lazy | chromium-semantic | PASS | 1779 | 3 |  |
| lazy | lightpanda-semantic | PASS | 1127 | 2 |  |
| shadow | lightpanda-enhanced | PASS | 947 | 2 |  |
| shadow | chromium-rendered | PASS | 1445 | 2 |  |
| shadow | chromium-semantic | PASS | 1459 | 2 |  |
| shadow | lightpanda-semantic | PASS | 1019 | 2 |  |
| iframe | lightpanda-enhanced | FAIL | 528 | 1 | Policy returned BLOCKED |
| iframe | chromium-rendered | PASS | 1356 | 2 |  |
| iframe | chromium-semantic | PASS | 1343 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 528 | 1 | Policy returned BLOCKED |
| css-hidden | lightpanda-enhanced | PASS | 929 | 2 |  |
| css-hidden | chromium-rendered | PASS | 1373 | 2 |  |
| css-hidden | chromium-semantic | FAIL | 1300 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-semantic | FAIL | 933 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-enhanced | PASS | 913 | 2 |  |
| pointer | chromium-rendered | PASS | 1391 | 2 |  |
| pointer | chromium-semantic | FAIL | 3512 | 9 | Invalid decision probabilities |
| pointer | lightpanda-semantic | FAIL | 4849 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-enhanced | FAIL | 5297 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | chromium-rendered | PASS | 1351 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 1372 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 964 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| autocomplete | lightpanda-enhanced | PASS | 2438 | 4 |  |
| autocomplete | chromium-rendered | PASS | 2758 | 4 |  |
| autocomplete | chromium-semantic | PASS | 2677 | 4 |  |
| autocomplete | lightpanda-semantic | PASS | 2290 | 4 |  |
| records | lightpanda-enhanced | PASS | 949 | 2 |  |
| records | chromium-rendered | PASS | 1406 | 2 |  |
| records | chromium-semantic | PASS | 1413 | 2 |  |
| records | lightpanda-semantic | PASS | 974 | 2 |  |
| canvas | lightpanda-enhanced | UNSUPPORTED | 169 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-rendered | UNSUPPORTED | 519 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-semantic | UNSUPPORTED | 522 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 167 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| read | chromium-rendered | PASS | 1036 | 1 |  |
| read | chromium-semantic | PASS | 976 | 1 |  |
| read | lightpanda-semantic | PASS | 594 | 1 |  |
| read | lightpanda-enhanced | PASS | 547 | 1 |  |
| form | chromium-rendered | PASS | 2847 | 5 |  |
| form | chromium-semantic | PASS | 2901 | 5 |  |
| form | lightpanda-semantic | PASS | 2136 | 5 |  |
| form | lightpanda-enhanced | PASS | 2474 | 5 |  |
| upload | chromium-rendered | PASS | 1827 | 3 |  |
| upload | chromium-semantic | PASS | 1754 | 3 |  |
| upload | lightpanda-semantic | PASS | 1336 | 3 |  |
| upload | lightpanda-enhanced | PASS | 1278 | 3 |  |
| menu | chromium-rendered | PASS | 2490 | 5 |  |
| menu | chromium-semantic | PASS | 2571 | 5 |  |
| menu | lightpanda-semantic | PASS | 2228 | 5 |  |
| menu | lightpanda-enhanced | PASS | 2329 | 5 |  |
| overlay | chromium-rendered | PASS | 1801 | 3 |  |
| overlay | chromium-semantic | PASS | 1897 | 3 |  |
| overlay | lightpanda-semantic | PASS | 1417 | 3 |  |
| overlay | lightpanda-enhanced | PASS | 1331 | 3 |  |
| lazy | chromium-rendered | PASS | 1870 | 3 |  |
| lazy | chromium-semantic | PASS | 1848 | 3 |  |
| lazy | lightpanda-semantic | PASS | 916 | 2 |  |
| lazy | lightpanda-enhanced | PASS | 1150 | 2 |  |
| shadow | chromium-rendered | PASS | 1292 | 2 |  |
| shadow | chromium-semantic | PASS | 1400 | 2 |  |
| shadow | lightpanda-semantic | PASS | 903 | 2 |  |
| shadow | lightpanda-enhanced | PASS | 922 | 2 |  |
| iframe | chromium-rendered | PASS | 1378 | 2 |  |
| iframe | chromium-semantic | PASS | 1415 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 492 | 1 | Policy returned BLOCKED |
| iframe | lightpanda-enhanced | FAIL | 499 | 1 | Policy returned BLOCKED |
| css-hidden | chromium-rendered | PASS | 1359 | 2 |  |
| css-hidden | chromium-semantic | PASS | 1359 | 2 |  |
| css-hidden | lightpanda-semantic | PASS | 903 | 2 |  |
| css-hidden | lightpanda-enhanced | PASS | 933 | 2 |  |
| pointer | chromium-rendered | PASS | 1497 | 2 |  |
| pointer | chromium-semantic | FAIL | 5551 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 4411 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-enhanced | PASS | 938 | 2 |  |
| trusted-pointer | chromium-rendered | PASS | 1507 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 5447 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 5314 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-enhanced | FAIL | 5443 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| autocomplete | chromium-rendered | PASS | 2916 | 4 |  |
| autocomplete | chromium-semantic | PASS | 2879 | 4 |  |
| autocomplete | lightpanda-semantic | PASS | 2313 | 4 |  |
| autocomplete | lightpanda-enhanced | PASS | 2327 | 4 |  |
| records | chromium-rendered | PASS | 1343 | 2 |  |
| records | chromium-semantic | PASS | 1369 | 2 |  |
| records | lightpanda-semantic | PASS | 1470 | 2 |  |
| records | lightpanda-enhanced | PASS | 1132 | 2 |  |
| canvas | chromium-rendered | UNSUPPORTED | 748 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-semantic | UNSUPPORTED | 622 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 175 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-enhanced | UNSUPPORTED | 167 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| read | chromium-semantic | PASS | 978 | 1 |  |
| read | lightpanda-semantic | PASS | 522 | 1 |  |
| read | lightpanda-enhanced | PASS | 602 | 1 |  |
| read | chromium-rendered | PASS | 906 | 1 |  |
| form | chromium-semantic | FAIL | 1120 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| form | lightpanda-semantic | FAIL | 624 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| form | lightpanda-enhanced | FAIL | 524 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| form | chromium-rendered | FAIL | 967 | 1 | Independent fixture oracle did not confirm exactly one correct result |
| upload | chromium-semantic | PASS | 1793 | 3 |  |
| upload | lightpanda-semantic | PASS | 1480 | 3 |  |
| upload | lightpanda-enhanced | PASS | 1950 | 3 |  |
| upload | chromium-rendered | PASS | 1894 | 3 |  |
| menu | chromium-semantic | PASS | 1983 | 3 |  |
| menu | lightpanda-semantic | PASS | 1305 | 3 |  |
| menu | lightpanda-enhanced | PASS | 1338 | 3 |  |
| menu | chromium-rendered | PASS | 1821 | 3 |  |
| overlay | chromium-semantic | PASS | 1883 | 3 |  |
| overlay | lightpanda-semantic | PASS | 1528 | 3 |  |
| overlay | lightpanda-enhanced | PASS | 1328 | 3 |  |
| overlay | chromium-rendered | PASS | 1899 | 3 |  |
| lazy | chromium-semantic | PASS | 2010 | 3 |  |
| lazy | lightpanda-semantic | PASS | 899 | 2 |  |
| lazy | lightpanda-enhanced | PASS | 922 | 2 |  |
| lazy | chromium-rendered | PASS | 1835 | 3 |  |
| shadow | chromium-semantic | PASS | 1471 | 2 |  |
| shadow | lightpanda-semantic | PASS | 1129 | 2 |  |
| shadow | lightpanda-enhanced | PASS | 911 | 2 |  |
| shadow | chromium-rendered | PASS | 1385 | 2 |  |
| iframe | chromium-semantic | PASS | 1491 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 2742 | 7 | Policy returned BLOCKED |
| iframe | lightpanda-enhanced | FAIL | 878 | 2 | Policy returned BLOCKED |
| iframe | chromium-rendered | PASS | 1841 | 2 |  |
| css-hidden | chromium-semantic | FAIL | 1590 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-semantic | FAIL | 940 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-enhanced | PASS | 1003 | 2 |  |
| css-hidden | chromium-rendered | PASS | 1700 | 2 |  |
| pointer | chromium-semantic | FAIL | 5693 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 5115 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-enhanced | PASS | 902 | 2 |  |
| pointer | chromium-rendered | PASS | 1413 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 5565 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 5056 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-enhanced | FAIL | 5618 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | chromium-rendered | PASS | 1604 | 2 |  |
| autocomplete | chromium-semantic | PASS | 2862 | 4 |  |
| autocomplete | lightpanda-semantic | PASS | 1793 | 4 |  |
| autocomplete | lightpanda-enhanced | PASS | 2182 | 4 |  |
| autocomplete | chromium-rendered | PASS | 2406 | 4 |  |
| records | chromium-semantic | PASS | 1369 | 2 |  |
| records | lightpanda-semantic | PASS | 891 | 2 |  |
| records | lightpanda-enhanced | PASS | 931 | 2 |  |
| records | chromium-rendered | PASS | 1331 | 2 |  |
| canvas | chromium-semantic | UNSUPPORTED | 552 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 171 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-enhanced | UNSUPPORTED | 170 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-rendered | UNSUPPORTED | 861 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |

Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.