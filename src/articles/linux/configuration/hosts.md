---
title: "/etc/hosts"
permalink: "etc_hosts"
---

そのマシン内でのみ有効な名前解決に用いられるテキストファイルです.
DNS による lookup ではなく, 静的にドメインを解決したい場合に利用できます.

## 書式

特定の IP アドレスに対して, ホスト名を羅列する形式で記述されます.

```text
<IP アドレス>   <ホスト名>    <ホスト名> ...
```

### 例

```text title="/etc/hosts"
127.0.0.1       localhost
::1             localhost
192.168.1.1     internal.example.com
```

## 優先度

このファイルに書かれたドメインは必ずその IP で解決されるというわけではありません.  
このファイル利用 / DNS 利用などの名前解決の優先度を定める [`/etc/nsswitch.conf`](/contents/etc_nsswitch_conf) が別途存在しており, その設定として記載された優先度に準じます.