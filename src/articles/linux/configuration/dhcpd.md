---
title: "/etc/dhcpd.conf"
permalink: "etc_dhcpd_conf"
---

DHCP サーバを設定するファイルです.
配布する IP アドレスやリース期間などを設定します.

現代では `/etc/dhcp/dhcpd.conf` が設定ファイルとなる場合もあります.

## 書式

```text
subnet [代表IP] netmask [サブネットマスク] {
    [各種オプション群]
}
```

### 例

```text title="/etc/dhcpd.conf"
subnet 192.168.0.0 netmask 255.255.255.0 {
    option routers      192.168.0.1;
    option subnet-mask  255.255.255.0;
    option domain-name  "example.com";

    option domain-name-servers  192.168.0.1, 192.168.0.2;
    option ntp-servers  192.168.0.2;

    range 192.168.0.128 192.168.0.254;
    default-lease-time  21600;
    max-lease-time      43200;

    host workstation1 {
        hardware ethernet   00:11:22:33:44:55;
        fixed-address       192.168.0.50;
    }
}
```

## 設定値

### 動的 IP 配布

| 設定値             | 内容                                       |
| :----------------- | :----------------------------------------- |
| default-lease-time | デフォルトのリース期限                     |
| max-lease-time     | 最大リース期限                             |
| range              | クライアントに割り当てる IP アドレスの範囲 |

### 静的 IP 配布

| 設定値             | 内容                                         |
| :----------------- | :------------------------------------------- |
| host               | 特定のホストに対しての直接の IP アドレス指定 |
| host.hardware      | MAC アドレスを指定する                       |
| host.fixed-address | 払い出す IP アドレスを指定する               |

### ネットワーク情報配布

DHCP は動的に IP アドレスを配布するプロトコルですが, IP 以外にもネットワーク関連の設定情報を配布できます.
これらは接続を要求したクライアントに対する情報配信設定となります.

| 設定値               | 内容                                   |
| :------------------- | :------------------------------------- |
| routers              | デフォルトゲートウェイの IP アドレス   |
| broadcast-address    | ブロードキャストアドレスの IP アドレス |
| subnet-mask          | サブネットマスク                       |
| domain-name-servers  | DNS サーバの IP アドレス               |
| ntp-servers          | NTP サーバの IP アドレス               |
| netbios-name-servers | WINS サーバの IP アドレス              |

内部ネットワーク内でのドメイン名省略時の解決補助設定などもあります.
この機能を利用する明確な用途が無ければ, 特に設定する必要はないでしょう.

| 設定値        | 内容                                        |
| :------------ | :------------------------------------------ |
| domain-name   | ドメイン省略時の補完ドメイン指定 (単一指定) |
| domain-search | ドメイン省略時の補完ドメイン指定 (複数指定) |

