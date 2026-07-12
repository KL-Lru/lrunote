---
title: "/etc/nsswitch.conf"
permalink: "etc_nsswitch_conf"
---

Name Server Switch を設定するファイルです.
名前解決の優先順序, ユーザ名の解決方法の優先順序などを設定します.

### 書式

```text
<対象の区分>: [利用する方法] [...]
```

#### 例

```text title="/etc/nsswitch.conf"
hosts:     mymachines files myhostname dns mdns

passwd:    files systemd
group:     files [success=merge] systemd
shadow:    files systemd
sudoers:   files

networks:  files
ethers:    files
services:  files
protocols: files
rpc:       files
```

### 設定値

主要な値として取りうる `files` や `systemd`, `dns` などは大抵のシステムで共通ですが, 仕様として設定可能な値が策定されているわけではありません.  
`libnss_myhostname.so.2` など, システムにインストールされている NSS ライブラリによってプラガブルに追加 / 設定できます.

このため, 以下に列記している内容についても, 利用できる場合/できない場合があります.

#### 名前解決

`hosts` 指定はドメインの名前解決に利用する方法の優先度を指定します.

| 値         | 内容                                                           |
| :--------- | :------------------------------------------------------------- |
| files      | [`/etc/hosts`](/contents/etc_hosts) ファイルの内容を参照する   |
| resolve    | systemd-resolved で名前解決を行う                              |
| mymachines | systemd-machined で管理されるコンテナや VM の名前解決を行う    |
| myhostname | 自身のホスト名を解決する                                       |
| dns        | `/etc/resolv.conf` を参照した DNS クエリを発行し名前解決を行う |
| mdns       | mDNS を利用した LAN 内の名前解決を行う                         |


#### ユーザ管理

`passwd`, `group`, `shadow`, `sudoers` はいづれもユーザ管理系の設定です.
ユーザ管理を `/etc/shadow` や `/etc/passwd` などを用いて行っている場合は `files`, LDAP や SSSD を利用している場合はそのプロトコル名の記載が一般的です.

| 値      | 内容                                  |
| :------ | :------------------------------------ |
| files   | 対応するファイルの内容を参照する      |
| sss     | SSSD を用いて対応する情報を取得する   |
| ldap    | LDAP を用いて対応する情報を取得する   |
| systemd | systemd の DynamicUser などを解決する |

#### その他の設定群

以下の設定値については現代において設定を変更する機会はほぼありません.
常時 `files` になることでしょう.

| オプション | 内容                                                 | 変更されなくなった理由                                                                         |
| :--------- | :--------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| networks   | ネットワークへの名前設定                             | CIDR の普及に伴い, 名前設定の労力が見合わない <br> CIDR を直接扱う形で困ることがなくなった     |
| ethers     | MAC アドレスとホストの紐づけ                         | 自身の IP が不明な場合に RARP などを利用していた名残 <br> BOOTP や DHCP などの普及に伴い形骸化 |
| services   | 主要なプロトコルとポートの紐づけ[^services]          | ほぼ静的に規定されている値であり変更する必要性がない                                           |
| protocols  | 通信プロトコル名とプロトコル番号の対応表[^protocols] | ほぼ静的に規定されている値であり変更する必要性がない                                           |
| rpc        | RPC で呼び出されるプロシージャと番号の対応表[^rpc]   | ほぼ静的に規定されている値であり変更する必要性がない                                           |

[^services]: [Service Name and Transport Protocol Port Number Registry](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)
[^protocols]: [Protocol Numbers](https://www.iana.org/assignments/protocol-numbers/protocol-numbers.xhtml)
[^rpc]: [Remote Procedure Call (RPC) Program Numbers](https://www.iana.org/assignments/rpc-program-numbers/rpc-program-numbers.xhtml)