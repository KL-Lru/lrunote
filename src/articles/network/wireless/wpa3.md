---
title: WPA3
permalink: wifi_protected_access_3
---

Wi-Fi Alliance が制定したセキュリティ規格です.

## 認証方式

パーソナルモードにおいては方式自体は [WPA2](/contents/wifi_protected_access_2) とほぼ同様のものを利用します.
異なる点として, PMK の算出を PBKDF2 ではなく SAE (Simulataneous Authentication of Equals) を利用します.

## 暗号化方式

エンタープライズモードにおいては暗号スイートとして CNSA が新たに利用可能となります.
