---
title: "d2 レンダリングサンプル"
description: "コードブロックから SVG へ変換される d2 図の描画確認用ページ"
permalink: "d2-sample"
---

このページは, ` ```d2 ` コードブロックがビルド時にインライン SVG へ変換されて描画されるかを確認するためのサンプルです.
図の色はテーマ変数へマッピングされているため, ライト / ダークのトグルに追従します.

## フローチャート

`direction` で描画方向を, `shape` で図形を指定できます.

```d2
direction: right
start: 起動 { shape: oval }
check: 設定を読む { shape: diamond }
run: 実行
end: 終了 { shape: oval }
start -> check -> run -> end
check -> end: skip
```

## シーケンス図

`shape: sequence_diagram` を指定すると, 上から下へ時系列で処理の流れを表現できます.

```d2
shape: sequence_diagram
browser: ブラウザ
server: サーバ
browser -> server: GET /
server -> browser: 200 OK
```

## コンテナ (グルーピング)

ネストした記述で, ノードをコンテナとしてまとめられます.
コンテナ内部のノードへは `親.子` の形式で接続します.

```d2
user: 利用者
cloud: クラウド {
  api: API
  db: DB { shape: cylinder }
  api -> db: query
}
user -> cloud.api: request
```

## テーブル (ER 図)

`shape: sql_table` で, カラムを持つテーブルを描けます.
`テーブル.カラム` 同士を接続するとリレーションを表現できます.

```d2
users: {
  shape: sql_table
  id: int
  name: varchar
}
posts: {
  shape: sql_table
  id: int
  user_id: int
}
posts.user_id -> users.id
```
