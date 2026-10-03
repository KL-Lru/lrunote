---
title: "DHCP"
permalink: "dhcp_protocol"
---

DHCP はサーバがクライアントに対して IP アドレスを払い出し, 割り当てるためのプロトコルです.
[RFC 2131](https://datatracker.ietf.org/doc/html/rfc2131) で標準化されています.
UDP を利用したプロトコルとなっており伝送可能な範囲もこれに準じます.

## 概要

おおまかな流れは次のようになります.
各メッセージの頭文字を取って DORA とか呼ばれたりします.

1. クライアントが DHCP サーバを見つけるために `DHCPDISCOVER` パケットをブロードキャストにて送付する
2. DHCP サーバが未使用の IP アドレス等必要な情報を設定して `DHCPOFFER` パケットを返送する
3. クライアントが指定された IP アドレスの利用を申請する `DHCPREQUEST` パケットを返送する
4. DHCP サーバが指定の IP アドレスが利用可能であれば `DHCPACK` パケットを返送する
5. クライアントは GARP をブロードキャストし, 受け取った IP アドレスが重複していないことを確認する
6. IP アドレスの利用開始

```d2
message: "DHCP の流れ" {
    near: top-center
    style: {
        fill: transparent
        stroke: transparent
        font-size: 12
    }
}

grid-columns: 3
grid-rows: 2

p1: "" {
    width: 10
    height: 10
    style: {
        fill: "#000000"
    }
}
pc1: PC1

p2: "" {
    width: 10
    height: 10
    style: {
        fill: "#000000"
    }
}
pc2: PC2

d1: "" {
    width: 10
    height: 10
    style: {
        fill: "#000000"
    }
}
dhcp: DHCP Server 

p1 -- p2 -- d1

p1 -- pc1 
p2 -- pc2
d1 -- dhcp

scenarios: {
    1: {
        message.label: "① DHCP サーバを探索"
        (p1 -- pc1 )[0]: null 
        (p2 -- pc2)[0]: null 
        (d1 -- dhcp)[0]: null 
        p1 <- pc1: DHCPDISCOVERY
        p2 -> pc2
        d1 -> dhcp
    }
    2: {
        message.label: "② DHCP サーバが応答 + IP アドレス提示"
        (p1 -- pc1 )[0]: null 
        (d1 -- dhcp)[0]: null 
        d1 <- dhcp: DHCPOFFER
        p1 -> pc1
    }
    3: {
        message.label: "③ 受け取りたい IP アドレスをリクエスト"
        (p1 -- pc1 )[0]: null 
        (p2 -- pc2)[0]: null 
        (d1 -- dhcp)[0]: null 
        p1 <- pc1: DHCPREQUEST
        p2 -> pc2
        d1 -> dhcp
    }
    4: {
        message.label: "④ IP アドレス割当を応答"
        (p1 -- pc1 )[0]: null 
        (d1 -- dhcp)[0]: null 
        d1 <- dhcp: DHCPACK
        p1 -> pc1
    }
    5: {
        message.label: "⑤ 重複がないか GARP で確認"
        (p1 -- pc1 )[0]: null 
        (p2 -- pc2)[0]: null 
        (d1 -- dhcp)[0]: null 
        p1 <- pc1: GARP
        p2 -> pc2
        d1 -> dhcp
    }
    6: {
        message.label: "IP 利用開始"
    }
}
```

## 通信詳細

### 利用するポートやプロトコル

DHCP は UDP 上で動作するプロトコルとなっています.
DHCP サーバ宛通信は 67, DHCP サーバからの通信は 68 のポートが利用されます.

### メッセージフォーマット

BOOTP (RFC 951) と同様のフォーマットを利用します.
UDP のデータ部としてこれが入ります.

```d2 style="max-width:500px"
grid-rows: 11
grid-gap: 0

classes: {
    ONECELL: {
        width: 100
    }
    TWOCELL: {
        width: 200
    }
    FULLCELL: {
        width: 400
    }
}

op (1).class: ONECELL
htype (1).class: ONECELL
hlen (1).class: ONECELL
hops (1).class: ONECELL

xid (4).class: FULLCELL

secs (2).class: TWOCELL
flags (2).class: TWOCELL

ciaddr (4).class: FULLCELL
yiaddr (4).class: FULLCELL
siaddr (4).class: FULLCELL
giaddr (4).class: FULLCELL
chaddr (16).class: FULLCELL
sname (64).class: FULLCELL
file (128).class: FULLCELL
options (variable).class: FULLCELL
```

| 種類    | 概要                    | 説明                                                                          |
| :------ | :---------------------- | :---------------------------------------------------------------------------- |
| op      | オペレーションコード    | BOOTREQUEST: 1 / BOOTREPLY: 2                                                 |
| htype   | ハードウェアタイプ      | ethernet の場合は 0x01                                                        |
| hlen    | ハードウェアアドレス長  | ethernet の場合は 0x06<br>(MAC アドレスが 6 byte)                             |
| hops    | ホップ数                | リレーエージェントでの中継回数                                                |
| xid     | トランザクション ID     | 乱数値                                                                        |
| secs    | 経過秒数                |                                                                               |
| flags   | フラグ                  | 最初の 1 bit のみ利用. 1 の場合応答も Broadcast にする                        |
| ciaddr  | Client IP Address       | 再リース要求時にクライアントが利用している IP アドレス                        |
| yiaddr  | Your IP Address         | DHCP サーバが払い出す IP アドレス                                             |
| siaddr  | Server IP Address       | DHCP サーバ自体の IP アドレス                                                 |
| giaddr  | Gateway IP Address      | 中継したリレーエージェントの IP アドレス                                      |
| chaddr  | Client Hardware Address | クライアントの MAC アドレスを格納 <br> (DHCP 側で MAC アドレスを指定する場合) |
| sname   | Server Name             | DHCP サーバのホスト名                                                         |
| file    | Boot File Name          | ネットワークブートする際に利用するファイルを指定                              |
| options | 各種オプション          | DHCP メッセージタイプ, デフォルトゲートウェイ等の追加情報 etc.                |

なおこれらのメッセージをリース前に送付する際, まだ IP アドレスが未付与のマシンからリクエストを送付することになります.
このため, IP ヘッダでの送信元 IP アドレスは `0.0.0.0` となります.

## DHCP Relay

ブロードキャストドメイン外に DHCP サーバがある場合には最初の DHCPDISCOVER が DHCP サーバまで届きません.
このような構成を取る場合には, マシンから送付された DHCPDISCOVER が届くよう, 別のブロードキャストドメインへとルータなどによって中継する必要があります.
この処理を **DHCP Relay** と呼びます.

この際, リレーされた先の別のブロードキャストドメインでのルータと DHCP サーバ間の通信はユニキャストとなります.
ルータは DHCP サーバの IP アドレスを知っており, ブロードキャストする必要がないためです.

## DHCP Snooping

DHCP では IP アドレスのリースのみではなく, デフォルトゲートウェイや DNS などの情報も配布できます.
このため, 攻撃されたルータやマシンが偽物の DHCP サーバとして動作すると, 様々な攻撃へとつながる状態となることがあります.
この偽物の DHCP サーバを稼働させる攻撃を **DHCP Spoofing** と呼びます.

これに対する対策として, ネットワークスイッチ上で DHCP のやり取りを監視し, 不正なメッセージをブロックする仕組みを **DHCP Snooping** と呼びます.
DHCP サーバからのメッセージが来るはずの Trusted なポートと, DHCP のクライアントからのメッセージしか来ないはずの Untrusted なポートに分けて管理します.
これにより, Untrusted なポートから不正な DHCP サーバの応答をすべて DROP し, 不正な DHCP サーバからのメッセージがクライアントに届くのを防止します.

## IPv6 での DHCP

前提として IPv6 では, SLAAC を利用したホスト側で IP アドレスの計算が行えるため, IP アドレスの割当においては DHCP はあまり必要となりません.
IP アドレスの割当以外の DNS, NTP サーバなどの情報を伝達するためには利用される場合があります.

### 概要

IPv4 の場合と異なり, IPv6 ではブロードキャストの概念がありません.
代わりにネットワーク内の DHCP サーバを指すマルチキャストアドレスである `ff02::1:2` に対してのリクエストとなります.

また, メッセージフォーマットも BOOTP 互換を捨てて大きく変わり, メッセージ自体も変わります.
DORA に対して SARR になります.

| IPv4         | IPv6      |
| :----------- | :-------- |
| DHCPDISCOVER | SOLICIT   |
| DHCPOFFER    | ADVERTISE |
| DHCPREQUEST  | REQUEST   |
| DHCPACK      | REPLY     |

### 利用するポートやプロトコル

UDP を利用する点は同様ですが, ポートは 546, 547 ポートを利用します.

### メッセージフォーマット

IPv6 版では BOOTP のフォーマット互換を捨て, 独自のフォーマットとなります.

