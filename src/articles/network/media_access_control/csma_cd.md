---
title: CSMA/CD
permalink: csma_cd
---

Carrier Sense Multiple Access with Collision Detection.

主に半二重通信を用いる有線 LAN での通信時に利用される衝突検知方式です.
伝送路が空くまで待機し, データ衝突が発生した場合にはその衝突を全ノードへ伝達し, 一定時間後に再送する形式を取ります.
[IEEE 802.3](https://standards.ieee.org/ieee/802.3/10422/) にて定義されています.

## 概要

1. 伝送路が空いているかを確認
2. 空いていれば送信を開始
3. 複数ノードが同時に送信した場合は衝突
4. 衝突を検知し, 全ノードに通達
5. しばらく待機してから再送する

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

grid-rows: 6
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
e1: 待機

p3: 送信開始
4-2: "" { class: NONE }
4-3: "" { class: NONE }

p4: 衝突が発生した {
    shape: diamond
}
5-2: "" { class: NONE }
e2: 全ノードに衝突伝達

p5: 送信完了 {
    shape: oval
}

p1 -> p2
p2 -> p3: Yes
p3 -> p4
p4 -> p5: No

p2 -> e1: No
p4 -> e2: Yes
e2 -> e1
e1 -> 2-1: 再試行
```


## 現代における用途

スイッチングハブやルータと各種マシンを接続するような形態で全二重通信する場合, 衝突する信号はスイッチやルータでバッファリングされ, 衝突することなくマシンへと届けられます.
CSMA/CD を利用する必要が生じるのは半二重通信となってしまうリピータハブを介したネットワーク構成の場合程度になります.

このため現代では CSMA/CD での衝突をどうするかというよりも, バッファがあふれるほどの通信が来た場合にどのようにフロー制御するか, というような方向にシフトされています.