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
dhcp: DHCP Server 
pc1: PC1
pc2: PC2
pc3: PC3

dhcp -- pc1
dhcp -- pc2
dhcp -- pc3

steps: {
    1: {
        pc2 -> dhcp: DHCPDISCOVER (bloadcast)
    }
    2: {
        pc2 <- dhcp: DHCPOFFER
    }
    3: {
        pc2 -> dhcp: DHCPREQUEST (bloadcast)
    }
    4: {
        pc2 <- dhcp: DHCPACK
    }
}
```

