---
title: "DHCP"
permalink: "dhcp_protocol"
---

DHCP はサーバがクライアントに対して IP アドレスを払い出し, 割り当てるためのプロトコルです.
[RFC 2131](https://datatracker.ietf.org/doc/html/rfc2131) で標準化されています.

## 概要

おおまかな流れは次のようになります.

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