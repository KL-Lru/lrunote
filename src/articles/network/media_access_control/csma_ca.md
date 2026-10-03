---
title: CSMA/CA
permalink: csma_ca
---

Carrier Sense Multiple Access with Collision Avoidance.

主に無線 LAN での通信時に利用される衝突回避方式です.
無線伝送路は送信中に衝突を検知できません.
そのため CSMA/CA では衝突の検知ではなく, あらかじめランダムな待機時間を挟むことで衝突そのものの発生を回避し, 受信側からの ACK 応答によって送達確認を行う形式を取ります.
[IEEE 802.11](https://standards.ieee.org/ieee/802.11/10548/) にて定義されています.

## 概要

1. 伝送路が空いているかを確認
2. 空いていれば一定時間待機
3. ランダムなバックオフ時間を追加で待機
4. バックオフ中に他ノードの送信を検知したら一時停止し, 再開時に残り時間から再開
5. バックオフが完了したら送信を開始
6. 正常に受信できた場合 ACK を応答
7. 送信側が一定時間内に ACK を受信できなければ衝突とみなし, バックオフ時間を広げて再送する

```d2 style="max-width:500px"
classes: {
    NONE: { 
        width: 5
        height: 1
        style {
            opacity: 0
        }
    }
}

grid-rows: 7
grid-columns: 3

p1: 送信要求 {
    shape: oval
}
1-2: "" { class: NONE }
1-3: "" { class: NONE }

2-1: "" { class: NONE }
2-2: "" { class: NONE }
2-3: "" { class: NONE }

p2: 伝送路が空いている {
    shape: diamond
}
3-2: "" { class: NONE }
e1: "待機"

p3: 一定時間 + ランダムバックオフ待機
4-2: "" { class: NONE }
4-3: "" { class: NONE }

p4: 送信開始
5-2: "" { class: NONE }
5-3: "" { class: NONE }

p5: ACK を受信した {
    shape: diamond
}
6-2: "" { class: NONE }
e2: バックオフ時間を拡大

p6: 送信完了 {
    shape: oval
}

p1 -> p2
p2 -> p3: Yes
p3 -> p4
p4 -> p5
p5 -> p6: Yes

p2 -> e1: No
e1 -> 2-1: 再試行

p5 -> e2: No
e2 -> e1
```

## RTS/CTS

無線 LAN では, 送信ノード同士が互いの電波を検知できない位置関係にある場合, 伝送路が空いているかの識別が正確にできず, 衝突を回避しきれません.
この対策として, データ送信の前に RTS (Request To Send) を送付し, アクセスポイントが CTS (Clear To Send) を返送することで送信許可を出す方式があります.
周囲のノードは RTS/CTS に含まれる通信時間の情報を読み取り, その間は送信を控えることで衝突を回避します.
