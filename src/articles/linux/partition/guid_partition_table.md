---
title: "GPT 方式"
permalink: "gpt_partition"
---

UEFI から読み込むことのできるパーティション形態です.
GPT ヘッダとエントリ配列からなるパーティションテーブルをバックアップも含めて保持し, EFI System Partition に格納した BootCode から起動する形で管理されます.

## 構造

### GPT ヘッダ

GPT のパーティションテーブルは第 2 セクタから格納されます. [^layout]
第 2 セクタには GPT ヘッダが格納されます.

|                     | offset | byte 数 | 内容                                                     |
| :------------------ | :----- | :------ | :------------------------------------------------------- |
| Signature           | 0      | 8       | ASCII の 8 文字 "EFI PART" 固定                          |
| Revision            | 8      | 4       | ヘッダのリビジョン                                       |
| Header Size         | 12     | 4       | GPT ヘッダのサイズ                                       |
| Header CRC32        | 16     | 4       | GPT ヘッダのチェックサム                                 |
| -                   | 20     | 4       | 予約スペース. ゼロ埋め                                   |
| Current LBA         | 24     | 8       | GPT ヘッダの格納されている LBA                           |
| Backup LBA          | 32     | 8       | GPT ヘッダのバックアップの格納されている LBA             |
| LBA of first usable | 40     | 8       | 最初の利用可能な LBA                                     |
| LBA of last usable  | 48     | 8       | 最後の利用可能な LBA                                     |
| Disk GUID           | 56     | 16      | Disk の UUID                                             |
| LBA of first entry  | 72     | 8       | 最初のパーティションテーブルエントリの格納されている LBA |
| Number of entries   | 80     | 4       | パーティションテーブルエントリの数                       |
| Size of entries     | 84     | 4       | パーティションテーブルエントリのサイズ (128)             |
| Entries CRC32       | 88     | 4       | パーティションテーブルエントリのチェックサム             |

### パーティションテーブルエントリ

パーティションテーブルエントリは GPT ヘッダに記録されている通りの LBA に, 規定の構造で格納されます.

|                    | offset | byte 数 | 内容                                                              |
| :----------------- | :----- | :------ | :---------------------------------------------------------------- |
| Partition Type     | 0      | 16      | パーティションの type の UUID. エントリが利用されていない場合は 0 |
| Partition GUID     | 16     | 16      | パーティション自体の UUID                                         |
| Start of Partition | 32     | 8       | パーティションの開始 LBA                                          |
| End of Partition   | 40     | 8       | パーティションの終了 LBA                                          |
| Attributes         | 48     | 8       | UEFI により予約された属性 bit                                     |
| Partition Name     | 56     | 72      | パーティション名                                                  |

仕様上は GPT ヘッダの指定によりパーティションテーブルエントリのサイズを 128 * 2n バイトまで拡張できますが, 拡張した領域は現状ではエントリの格納時にゼロ埋めされ特に効力は持ちません.

### PMBR

GPT 方式の場合, MBR のみしかサポートしていない機体で読み込まれた場合に, その機体によってパーティションが不当に読み込まれたり, 破壊されたりするのを避ける必要があります.
この対策に向けて, 最初のセクタにはダミーとなる領域のみを指し示すように調整された Protective な MBR が差し込まれています.[^pmbr]

MBR 同様の構成を取り, 次のただ一つのみのパーティションテーブルがダミーとして記録されている状態となります.

|                          | offset | byte 数 | 内容                                              |
| :----------------------- | :----- | :------ | :------------------------------------------------ |
| Boot indicator           | 0      | 1       | 0x00. これ以外の値の場合, BIOS 等での挙動は未定義 |
| Start of partition (CHS) | 1      | 3       | 0x000200.                                         |
| Type                     | 4      | 1       | 0xEE (GPT Protective)                             |
| End of partition (CHS)   | 5      | 3       | 最終 CHS または 0xFFFFFF                          |
| Start of partition (LBA) | 8      | 4       | 0x00000001                                        |
| Size of partition (LBA)  | 12     | 4       | ディスクサイズ - 1 または 0xFFFFFFFF              |


## 制約

MBR と異なり, ヘッダとテーブルは分かれており, 1 セクタ内に収める制約も撤廃されているため, パーティション作成数上限はかなりゆるくなります.

ヘッダ上は 4 byte で表現可能な数までであれば格納可能であり, 理論上は 2^32 - 1 個までパーティションを作成できます.
とはいえ一般的には最大 128 パーティションまでとされます.
これは UEFI の仕様として, GPT パーティションのテーブルエントリの格納のための最小バイト数が 16,384 byte であることに起因します.
16,384 / 128 = 128 であり, UEFI の定める仕様にしたがって最小限にのみ領域を確保した場合の上限が 128 パーティションとなります.

[^layout]: [GUID Partition Table Disk Layout - GUID Partition Table (GPT) Disk Layout](https://uefi.org/specs/UEFI/2.10/05_GUID_Partition_Table_Format.html?#guid-partition-table-gpt-disk-layout-1)
[^pmbr]: [GUID Partition Table Disk Layout - Protective MBR](https://uefi.org/specs/UEFI/2.10/05_GUID_Partition_Table_Format.html#protective-mbr)