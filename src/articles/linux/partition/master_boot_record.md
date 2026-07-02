---
title: "MBR 方式"
permalink: "mbr_partition"
---

BIOS / UEFI どちらからも読み込むことのできる, レガシーシステムで採用されるパーティション形態です.  
Master Boot Record と呼ばれる, Boot に必要な bootstrap コードや, パーティションテーブルをディスク先頭セクタに格納する形で管理します.

## 構造

### MBR

BIOS ではセクタ長が 512 bytes, 先頭 1 セクタのみがロード対象となるため, MBR のサイズは全長 512 bytes となっています.
MBR は次の通りに構成されます.[^1]

|                 | offset | byte 数     | 内容                                                            |
| :-------------- | :----- | :---------- | :-------------------------------------------------------------- |
| Bootstrap Code  | 0      | 446         | 起動対象のパーティションを選択し, BIOS にそのアドレスを受け渡す |
| Partition Table | 446    | 64 (16 * 4) | パーティションのアドレスや Boot フラグを管理する                |
| Boot Signature  | 510    | 2           | `0xAA55` 固定値                                                 |

Bootstrap Code は実際には Disk Signature などが含まれ, BootCode + それらの総計で 446 byte となります.

### パーティションテーブル

パーティションテーブルは次の 16 byte で構成されます.

|                          | offset | byte 数 | 内容                                   |
| :----------------------- | :----- | :------ | :------------------------------------- |
| Boot indicator           | 0      | 1       | Boot 可否                              |
| Start of partition (CHS) | 1      | 3       | パーティションの最初のセクタ指定       |
| Type                     | 4      | 1       | パーティションのファイルシステム識別子 |
| End of partition (CHS)   | 5      | 3       | パーティションの最後のセクタ指定       |
| Start of partition (LBA) | 8      | 4       | パーティションの最初のセクタ指定       |
| Size of partition (LBA)  | 12     | 4       | パーティションのサイズ指定             |

### EBR

ディスクパーティションテーブルが 64 byte しかありません.
各パーティション情報が 16 byte あるため, MBR の構造上の上限としてディスクに対して作成できる基本パーティションは最大でも 4 つまでとなります.

パーティション数の制約を回避するため, 基本パーティションのうちの 1 つを拡張パーティションとして, そのパーティション上に論理パーティションを構築できます.  
この拡張パーティションとする場合, MBR の Type には `0x05` または `0x0F` が指定されます. [^2]  
この論理パーティションは EBR と呼ばれる各パーティションに付随するパーティションテーブルを用いて管理されます.

EBR は構造としては MBR とほぼ同等の構造を取り, 格納するパーティションテーブルの内容に差異があります. [^3]
EBR ではパーティションテーブルを 2 テーブル分のみを利用し, 1 つ目のテーブルに自身のパーティションの情報を, 2 つ目のテーブルに次の EBR を利用したパーティションの情報を格納します.  
ディスク先頭に固定で配置する MBR とは異なり, EBR は連なるリストのように設定でき, このチェーンによってパーティション数の上限を解消しています.

ただし起動時に BIOS や Bootstrap Code が EBR を辿って走破するようなことはありません.
このため BIOS 利用のシステムでは, EBR を利用する論理パーティションはブート対象に指定できなくなります.

[^1]: [GUID Partition Table Disk Layout - Legacy Master Boot Record](https://uefi.org/specs/UEFI/2.10/05_GUID_Partition_Table_Format.html#legacy-master-boot-record-mbr)
[^2]: [Partition Types: List of partition identifiers for PCs](https://aeb.win.tue.nl/partitions/partition_types-1.html)
[^3]: [パーティションテーブル - OSDev wiki](https://wiki.osdev.org/Partition_Table)
