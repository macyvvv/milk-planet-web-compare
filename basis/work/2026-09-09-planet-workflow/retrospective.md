# Retrospective

## Observed event

- Shandyの初案がスキン交換に寄った
- ヒーロー画像の境界とHTMLの歓迎文の改行を誤った
- 画像内文字とHTML本文が重複した
- 新宿の`event1.jpg`に含まれる更新特典を初回実装で落とした
- ローカル未コミット、リモートブランチ、PR、mainマージの状態を混同した

## Detection phase

- スキン化、画像境界、改行、重複: Checkでユーザーが検出
- `event1.jpg`の欠落: Observe / Content gateの不足を実装後に検出
- merge状態: Release verificationの不足を確認時に検出

## Missed gate or cause

- 原典の全画像と更新情報の対応表を、実装前に必須化していなかった
- 独立監査をSkill上は要求していたが、作業状態として保存・検証していなかった
- releaseを一つの「マージ済み」状態として扱い、commit・push・PR・mergeを分解していなかった

## Generalizable rule

- 画像・告知・特典・更新情報をSource mapへ記録し、処理結果を必ず持つ
- 親Skillは実装Skillより先に作業パケットとScopeを固定する
- 実装者の自己確認と独立監査を別フェーズにする
- リリース状態を状態機械として記録する

## Skill or validator change

- `skills/planet-web-workflow/SKILL.md`を新設
- `references/work-packet-schema.md`で必須証跡を固定
- `scripts/validate_work_packet.py`で欠落証跡をFAILにする
- `tools/validate_repo_contract.py`へ親Skillの契約を追加
- `AGENTS.md`と`basis/system_spec.md`から親Skillを参照
- 親Skillと専門Skillの重複を縮小し、validatorをゲート状態・source row・viewport・release状態まで強化
- 状態が`DECIDED`以降へ進んだ場合に必要なゲートの`PASS`をvalidatorで要求し、同一ゲートの重複宣言も拒否

## Follow-up

- 次の別店舗または別ページで、作業開始からReleaseまでこのパケットを実際に使用する
- その結果、過剰な記録や不足するゲートだけを修正する
