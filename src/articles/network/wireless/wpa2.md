---
title: WPA2
permalink: wifi_protected_access_2
---

IEEE 802.11i を元に標準化されたセキュリティ規格です.

## 認証方式

ほとんど [WPA](/contents/wifi_protected_access) と同様の方式を取ります.
異なる点は PMK をキャッシュできる機構が導入された程度です.

## 暗号化

AES をベースとした CCMP が採用されています.
AES はブロック暗号方式であり, それをストリーム暗号方式で利用できるよう拡張したものが CCMP です.
