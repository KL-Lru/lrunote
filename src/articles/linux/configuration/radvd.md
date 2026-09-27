---
title: "/etc/radvd.conf"
permalink: "etc_radvd_conf"
---

radvd (Router ADVertisement Daemon) 系の設定を記述するファイルです.
IPv6 のアドレスを自動設定する用途に用いられ, ルータとなるマシンで利用されます.
IPv6 では RS/RA が必須の構成要素であり, radvd は RA の発信を担います.

## 書式

```text
interface [NIC 名]
{
    [option 指定]
};
```

### 例

```text title="/etc/radvd.conf"
interface eth0
{
    AdvSendAdvert on;
    prefix 2001:db8:1::/64
    {
        AdvOnLink on;
        AdvAutonomous on;
    };
};
```

## 設定値

### interface レベル

| 設定値             | 内容                                                                 |
| :----------------- | :------------------------------------------------------------------- |
| AdvSendAdvert      | RA を送付するかどうか                                                |
| AdvManagedFlag     | M フラグ <br> on にすることで DHCP を利用させる                      |
| AdvOtherConfigFlag | O フラグ <br> on にすることで DNS 等の追加情報を DHCP から取得させる |

DHCP で配布される IPv4 のアドレスとは異なり, IPv6 では IP アドレスの自動設定には 2 つの設定方法があります.

| 方式  | 内容                                                   |
| :---- | :----------------------------------------------------- |
| SLAAC | ルータから RA を配布し, ホストが IP アドレスを算出する |
| DHCP  | IPv4 同様に, 専用のサーバがアドレスを管理し, 配布する  |

M フラグや O フラグはこれらを切り替え, クライアントへと通知するための設定です.

### prefix レベル

| 設定値        | 内容                                                       |
| :------------ | :--------------------------------------------------------- |
| AdvOnLink     | L フラグ<br> このプレフィックスが直接到達可能か            |
| AdvAutonomous | A フラグ <br> このプレフィックスからアドレスを算出させるか |
