import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatPeriodLabel,
  buildStoreUnsubmittedText,
  buildAllStoresUnsubmittedText,
} from "./notification-text.ts";

describe("formatPeriodLabel", () => {
  it("labels the first half of a month", () => {
    assert.equal(formatPeriodLabel(new Date(Date.UTC(2026, 7, 1))), "8月前半");
  });
  it("labels the second half of a month", () => {
    assert.equal(formatPeriodLabel(new Date(Date.UTC(2026, 7, 16))), "8月後半");
  });
});

describe("buildStoreUnsubmittedText", () => {
  it("matches the spec example format", () => {
    const text = buildStoreUnsubmittedText("8月前半", {
      storeName: "Milkplanet",
      names: ["あい", "うみ", "さくら"],
      deadlineLabel: "7月28日 23:59",
    });
    assert.equal(
      text,
      "【Milkplanet】\n8月前半シフト未提出：あい、うみ、さくら\n提出期限：7月28日 23:59",
    );
  });
});

describe("buildAllStoresUnsubmittedText", () => {
  it("matches the spec example format with a shared deadline", () => {
    const text = buildAllStoresUnsubmittedText("8月前半", [
      { storeName: "Milkplanet", names: ["あい", "うみ", "さくら"], deadlineLabel: "共通" },
      { storeName: "BloodySugar", names: ["かえで", "しおり"], deadlineLabel: "共通" },
      { storeName: "RoyalSugar", names: ["なな", "まり"], deadlineLabel: "共通" },
    ]);
    assert.equal(
      text,
      [
        "【8月前半シフト未提出者】",
        "",
        "■ Milkplanet",
        "あい、うみ、さくら",
        "",
        "■ BloodySugar",
        "かえで、しおり",
        "",
        "■ RoyalSugar",
        "なな、まり",
        "",
        "提出期限：共通",
      ].join("\n"),
    );
  });

  it("omits stores with no unsubmitted casts", () => {
    const text = buildAllStoresUnsubmittedText("8月前半", [
      { storeName: "Milkplanet", names: ["あい"], deadlineLabel: "x" },
      { storeName: "EmptyStore", names: [], deadlineLabel: "x" },
    ]);
    assert.equal(text.includes("EmptyStore"), false);
  });

  it("notes per-store deadlines when they differ", () => {
    const text = buildAllStoresUnsubmittedText("8月前半", [
      { storeName: "A", names: ["あい"], deadlineLabel: "7/28" },
      { storeName: "B", names: ["うみ"], deadlineLabel: "7/29" },
    ]);
    assert.match(text, /各店舗の案内を確認/);
  });

  it("says nobody is unsubmitted when every group is empty", () => {
    const text = buildAllStoresUnsubmittedText("8月前半", [{ storeName: "A", names: [] }]);
    assert.equal(text, "【8月前半シフト未提出者】\n\n該当者はいません。");
  });
});
