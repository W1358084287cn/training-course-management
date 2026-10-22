<template>
  <div class="wrap">
    <div class="bar">
      <div class="left">
        <div class="tip">
          页面数据通过后端+MySQL持久化，当前页为旧版界面接入。
        </div>
      </div>
      <div class="right">
        <a class="btn" href="/legacy" target="_blank" rel="noreferrer">新窗口打开</a>
      </div>
    </div>
    <iframe class="frame" src="/legacy" />
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 54px);
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
}
.tip {
  font-size: 12px;
  color: #6b7280;
}
.btn {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  text-decoration: none;
  color: #111827;
}
.frame {
  flex: 1;
  width: 100%;
  border: 0;
}
</style>

