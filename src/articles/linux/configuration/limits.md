---
title: "/etc/security/limits.conf"
permalink: "etc_security_limits"
---

## /etc/security/limits.conf

`ulimit` で付与できる制限と同様の制限を永続的に付与する設定ファイルです.
`ulimit` は実行された特定のセッションにのみ適用されるのに対し, こちらは設定後の各種セッションに対して適用されます.

### 書式

```plaintext
<対象> <制限タイプ> <項目> <設定値>
```

```text:/etc/security/limits.conf
*   soft    core    0          # デフォルトでは corefiles への dump を防いでおく
*   hard    core    unlimited  # 必要になった場合はユーザが無制限にリミットを解除できるようにする
```

設定が適用されるのは各種ログインセッションのみであり, `systemd` により起動される daemon 群に対しては効力を持ちません.

これらに対する制限を適用する場合は別途制限を付与する設定が必要となります.
