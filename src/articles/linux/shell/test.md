---
title: "条件記述 (Bourne Shell)"
permalink: "shell_test_command"
---

## シェルの条件記述

Bourne Shell をはじめとした各種シェルで記述できる条件記述の一覧です.

POSIX 準拠の `test` コマンドやその糖衣構文 `[ 条件式 ]` で利用できる記述です. [^1]

```bash
if [ condition ]
then
    echo "true"
else
    echo "false"
fi
```

### 数値比較

| 条件式    | 内容                |                      |
| :-------- | :------------------ | :------------------- |
| `A -eq B` | A と B が等しい     | EQual                |
| `A -ne B` | A と B が等しくない | Not Equal            |
| `A -gt B` | A が B よりも大きい | Greater Than         |
| `A -ge B` | A が B 以上         | Greater than or Equal |
| `A -lt B` | A が B よりも小さい | Less Than            |
| `A -le B` | A が B 以下         | Less than or Equal   |

### 文字列比較

| 条件式     | 内容                    |
| :--------- | :---------------------- |
| `S1 = S2`  | S1 と S2 が等しい       |
| `S1 != S2` | S1 と S2 が等しくない   |
| `-n S`     | S の長さが 0 より大きい |
| `-z S`     | S の長さが 0 である     |

### パス特性

| 条件式      | 内容                                                                  |              |
| :---------- | :-------------------------------------------------------------------- | :----------- |
| `F1 -nt F2` | F1 の最終更新時刻が F2 よりも新しい                                   | Newer Than   |
| `F1 -ot F2` | F1 の最終更新時刻が F2 よりも古い                                     | Older Than   |
| `F1 -ef F2` | F1 と F2 の Device, inode が同一 (ハードリンク)                       | Equal File   |
| `-e Path`   | 指定したパスが存在している                                            | Exists       |
| `-d Path`   | 指定したパスが存在している かつ ディレクトリである                    | Directory    |
| `-f Path`   | 指定したパスが存在している かつ ファイルである                        | File         |
| `-r Path`   | 指定したパスが存在している かつ 読取権限を有している                  | Readable     |
| `-w Path`   | 指定したパスが存在している かつ 書込権限を有している                  | Writable     |
| `-x Path`   | 指定したパスが存在している かつ 実行権限を有している                  | eXecutable   |
| `-s Path`   | 指定したパスが存在している かつ サイズが 0 よりも大きいファイルである | Sized        |
| `-S Path`   | 指定したパスが存在している かつ Socket ファイルである                 | Socket       |
| `-L Path`   | 指定したパスが存在している かつ シンボリックリンクである              | Link         |
| `-k Path`   | 指定したパスが存在している かつ Sticky Bit が設定されている           | sticKy       |
| `-u Path`   | 指定したパスが存在している かつ SUID が設定されている                 | set User id  |
| `-g Path`   | 指定したパスが存在している かつ SGID が設定されている                 | set Group id |

### 条件結合

| 条件式        | 内容                   |      |
| :------------ | :--------------------- | :--- |
| `! Condition` | 条件を満たさない       |      |
| `C1 -a C2`    | 両方の条件を満たす     | And  |
| `C1 -o C2`    | どちらかの条件を満たす | Or   |

`-a`, `-o` については, 現在 `test` コマンドの用法としてはあまり推奨されていません.
単一の `test` コマンドの結合として記述するのではなく, 複数の `test` コマンドを `&&`/`||` でつなぐ形で表現することが推奨されています.

```bash
# obsolescent
test conditionA -a conditionB
if [ conditionA -a conditionB ]; then echo "true" ; fi

test conditionA -o conditionB
if [ conditionA -o conditionB ]; then echo "true" ; fi

# recommended
test conditionA && test conditionB
if [ conditionA ] && [ conditionB ]; then echo "true"; fi

test conditionA || test conditionB
if [ conditionA ] || [ conditionB ]; then echo "true"; fi
```

[^1]: [test(1p) posix man page](https://www.unix.com/man_page/posix/1p/test/)
