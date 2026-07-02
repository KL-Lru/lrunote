---
title: "条件記述 (Bash / Zsh)"
permalink: "shell_extended_test_command"
---

## シェルの条件記述

Bash や Zsh でのみ利用できる `[[ 条件文 ]]` コマンドによる条件記述の一覧です. (以下拡張 `test` コマンドと記述します.)  
実行されるシェル環境が確定している場合は, こちらを利用するほうが安全でしょう.

基本のシェル条件記述については [Bourne Shell版](/contents/shell_test_command) を参照ください.

### `test` コマンド(`[ 条件式 ]`)との差異

基本的に `test` コマンドで記述できる条件はほぼすべて利用可能です.

#### 変数展開

`test` コマンドでは変数内の文字列に空白などの IFS に含まれる文字が使用されている場合に, 意図せず式を破壊することがあります.  
これを回避するためには, 文字列を格納した変数を条件式に利用する際にはダブルクォーテーションで囲ってやる必要がありました.

拡張 `test` コマンドでは, IFS の設定値によらず, 安全に変数を取り扱うことができます.
このためダブルクォーテーションを忘れてしまったとしてもエラーにはなりません.

IFS のデフォルト値は大抵の場合で空白です.
悪意を持って書き換えれば, `test` コマンドで記述された誤ったスクリプトは破壊できます.

```bash
var="foo bar"

[ $var = "foo bar" ]   # [ foo bar = "foo bar" ] に展開されて壊れる
[ "$var" = "foo bar" ] # [ "foo bar" = "foo bar" ] と解釈される (クォーテーションが必要)
[[ $var = "foo bar" ]] # [ "foo bar" = "foo bar" ] 相当で解釈される

# IFS を変更すると空白以外でもエラーになる
IFS=":"
var="foo:bar"

[ $var = "foo:bar" ]   # [ foo bar = "foo:bar" ] に展開されて壊れる (: が区切り文字判定を食らって分割される)
[ "$var" = "foo:bar" ] # [ "foo:bar" = "foo:bar" ] と解釈される (クォーテーションが必要)
[[ $var = "foo:bar" ]] # [ "foo:bar" = "foo:bar" ] 相当で解釈される
```

#### 正規表現の利用

`=~` を利用することで正規表現を利用して文字列を比較できます.

```bash
if [[ "foo-x-bar" =~ ^[a-z]+-x-[a-z]+$ ]]
then
    echo "ok"
fi

# 変数格納の場合はクォーテーションで囲まない
regex="^[a-z]+ x [a-z]+$"
if [[ "foo x bar" =~ $regex ]]
then
    echo "ok"
fi
```

#### パターンマッチ

`==` を利用することで glob によるパターンマッチで文字列を比較できます.
等価比較ではなくパターンマッチとなる点に注意が必要です.

```bash
var="hogepiyo"

[[ $var == hoge* ]] # => true
[[ $var == hogepiy? ]] # => true
```

#### 内部での条件結合

`test` コマンドでは `&&` や `||` を利用する場合はそれぞれ別の `test` コマンドを利用する必要がありました.
拡張 `test` コマンドでは, 1 つに括って記述可能です. 代わりとして `-a` や `-o` は利用できません.

```bash
# test command
[ conditionA ] && [ conditionB ]
[ conditionA -a conditionB ]

# extended test command
[[ conditionA && conditionB ]]
```
