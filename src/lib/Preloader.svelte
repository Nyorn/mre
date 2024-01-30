<script>

  export let loading;

  // Функция для блокировки скролла
  function preventScroll() {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  // Функция для разрешения скролла
  function allowScroll() {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  // Подписываемся на состояние loading и обновляем стили для body
  $: if (typeof window !== 'undefined') {
    if ($loading) {
      preventScroll();
    } else {
      allowScroll();
    }
  }

</script>



  <div class="preloader" class:loaded={!loading}>
  <div class="logotype mb-0 md:mb-0 flex items-center justify-center">
    <a href="https://sea-estate.com/" class="flex items-center">
      <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBVcGxvYWRlZCB0bzogU1ZHIFJlcG8sIHd3dy5zdmdyZXBvLmNvbSwgR2VuZXJhdG9yOiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIGZpbGw9IiMwMDAwMDAiIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgDQoJIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDQzLjM2NCA0My4zNjQiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxwb2x5Z29uIHBvaW50cz0iMzEuNDU4LDE5LjMgMzEuODg2LDE5LjMgMzIuNDUzLDE5LjI0NSAzMi43NDYsMTguODk3IDMyLjQzNSwxOC43NzYgMzIuMjY1LDE4LjU3OSAzMi4wMDgsMTguMTY1IDMxLjg4NiwxNy41NzkgDQoJCQkzMS40MDUsMTcuNjc3IDMxLjI2OSwxNy44ODMgMzEuMjY5LDE4LjExNiAzMS41MDEsMTguMjc1IDMxLjgzMSwxOC40ODMgMzEuODYxLDE4LjcyIDMxLjUwNywxOC43OTMgCQkiLz4NCgkJPHBvbHlnb24gcG9pbnRzPSIzMC43NywxOC4zMjkgMzAuNDc3LDE4Ljc5OSAzMC40NzcsMTkuMTA0IDMwLjgxOCwxOS4xMDQgMzEuNDIyLDE4LjY3NyAzMS40NDcsMTguMzYgMzEuMTY0LDE4LjIzOCAJCSIvPg0KCQk8cGF0aCBkPSJNMjMuMjA3LDIwLjI0OGgtMC40MjF2MC4yMTZoMC4xMDJjMCwwLDAuMDA1LDAuMDQ3LDAuMDE1LDAuMTA2bDAuMjU3LTAuMDIxbDAuMTYyLTAuMWwwLjA0Mi0wLjIwMmwwLjIwOS0wLjAxOQ0KCQkJbDAuMDgyLTAuMTdsLTAuMTkxLTAuMDM5bC0wLjE2NywwLjAwM0wyMy4yMDcsMjAuMjQ4eiIvPg0KCQk8cG9seWdvbiBwb2ludHM9IjIyLjE5MywyMC42MyAyMi40OTgsMjAuNjA1IDIyLjUzMSwyMC4zOTIgMjIuMzQ2LDIwLjI0OCAyMi4yMDksMjAuNDE5IAkJIi8+DQoJCTxwYXRoIGQ9Ik00MC41MSwyNy4yYy0wLjAwNS0wLjQ2OS0wLjAyOS0wLjkzMy0wLjA3My0xLjM5MWMtMC4xNDYtMS41MjQtMC41MTMtMi45ODUtMS4wNi00LjM1NQ0KCQkJYy0wLjA0MS0wLjEwMy0wLjA3OS0wLjIwNi0wLjEyLTAuMzA3Yy0wLjcyOS0xLjcyLTEuNzUyLTMuMjg0LTMuMDAyLTQuNjM2Yy0wLjA4Mi0wLjA4OS0wLjE2NS0wLjE3NS0wLjI0OS0wLjI2Mg0KCQkJYy0wLjIzNy0wLjI0NC0wLjQ3OC0wLjQ4NC0wLjczMS0wLjcxNGMtMi44NDQtMi41OS02LjYyMS00LjE3MS0xMC43NjItNC4xNzFjLTAuNTg1LDAtMS4xNiwwLjAzOS0xLjcyOSwwLjEwMQ0KCQkJYy0wLjEyMywwLjQ3My0wLjI3NiwwLjkzNC0wLjQ1OSwxLjM4NWMwLjcxNS0wLjEwNywxLjQ0NC0wLjE2OSwyLjE4OC0wLjE2OWMzLjcxMiwwLDcuMTA2LDEuMzg4LDkuNjk0LDMuNjY4bC0wLjE3NCwwLjMxMw0KCQkJbC0wLjY3OSwwLjI2NWwtMC4yODMsMC4zMWwwLjA2NCwwLjM2MmwwLjM1LDAuMDQ4bDAuMjEyLDAuNTI2bDAuNjAyLTAuMjQybDAuMSwwLjcwNGgtMC4xODJsLTAuNDk2LTAuMDczbC0wLjU0OCwwLjA5Mg0KCQkJbC0wLjUzMSwwLjc1bC0wLjc1OSwwLjEybC0wLjExLDAuNjQ5bDAuMzIsMC4wNzZsLTAuMDkyLDAuNDE4bC0wLjc1NS0wLjE1MmwtMC42OTIsMC4xNTJsLTAuMTQ2LDAuMzg0bDAuMTE5LDAuODA5bDAuNDA1LDAuMTg5DQoJCQlsMC42ODItMC4wMDRsMC40NTktMC4wNDJsMC4xNDItMC4zNjVsMC43MTctMC45MzVsMC40NzUsMC4wOTdsMC40NjYtMC40MjFsMC4wODYsMC4zMjlsMS4xNDYsMC43NzJsLTAuMTQsMC4xODhsLTAuNTE3LTAuMDI4DQoJCQlsMC4xOTgsMC4yODJsMC4zMTgsMC4wN2wwLjM3My0wLjE1NWwtMC4wMDctMC40NDlsMC4xNjYtMC4wODNsLTAuMTMzLTAuMTQxTDM0LjYsMjAuNzM4bC0wLjIwMi0wLjU2NmgwLjYzN2wwLjIwMiwwLjIwMQ0KCQkJbDAuNTQ4LDAuNDcybDAuMDIyLDAuNTdsMC41NjcsMC42MDRsMC4yMTEtMC44MjhsMC4zOTMtMC4yMTNsMC4wNzMsMC42NzdsMC4zODQsMC40MjJsMC43NjYtMC4wMTUNCgkJCWMwLjE0NywwLjM4MSwwLjI4LDAuNzcsMC4zOTYsMS4xNjRsLTAuMDgyLDAuMDc1aC0xLjE3MUwzNi42MywyMi43N2wtMC43NSwwLjA3MnYwLjQ1OWgtMC4yMzlsLTAuMjU1LTAuMTg0bC0xLjMtMC4zMjl2LTAuODQyDQoJCQlsLTEuNjQ3LDAuMTI5bC0wLjUxMiwwLjI3MmgtMC42NTRsLTAuMzItMC4wMzJsLTAuNzk0LDAuNDQxdjAuODI5bC0xLjYyMiwxLjE3MmwwLjEzNCwwLjVIMjlsLTAuMDg3LDAuNDc3bC0wLjIzMSwwLjA4OA0KCQkJbC0wLjAxMiwxLjI0NGwxLjQwMywxLjU5OWgwLjYwOWwwLjAzOC0wLjA5OWgxLjA5OWwwLjMxNS0wLjI5MmgwLjYyNGwwLjM0MSwwLjM0MmwwLjkyOCwwLjA5OGwtMC4xMjMsMS4yMzJsMS4wMywxLjgxNw0KCQkJbC0wLjU0MiwxLjAzN2wwLjAzNywwLjQ4OGwwLjQyOCwwLjQyN3YxLjE3NGwwLjU2MSwwLjc1NXYwLjk3N2gwLjQ4NWMtMi42OTUsMy4zMS02LjgsNS40MjktMTEuMzksNS40MjkNCgkJCWMtOC4wOTcsMC0xNC42ODQtNi41ODgtMTQuNjg0LTE0LjY4NWMwLTEuNTI2LDAuMjM1LTIuOTk5LDAuNjY5LTQuMzg1bC0wLjIwMS0wLjI5OGMtMC4wNjctMC4wOTktMC4zMzQtMC40ODYtMC43MTktMS4wMg0KCQkJYy0wLjY4MSwxLjc3Mi0xLjA2NSwzLjY5LTEuMDY1LDUuNzAxYzAsOC44MjIsNy4xNzgsMTYsMTYsMTZjNi4yMDYsMCwxMS41OTQtMy41NTUsMTQuMjQ2LTguNzMNCgkJCWMwLjU2Ny0xLjEwNywxLjAwOS0yLjI4OCwxLjMwNy0zLjUyMmMwLjA3NS0wLjMxMywwLjE0MS0wLjYzMSwwLjE5Ny0wLjk0OWMwLjE2MS0wLjkwOSwwLjI0OS0xLjg0MywwLjI0OS0yLjc5Nw0KCQkJQzQwLjUxMywyNy4zMDksNDAuNTExLDI3LjI1NCw0MC41MSwyNy4yeiBNMzUuNjI2LDE4LjU1MmwtMS4wMDctMC4wMDlsLTAuMDYzLTAuMjFsMC42MzEtMC4zMjFsMC4wMDMtMC43MTQNCgkJCWMwLjI1MSwwLjI2NiwwLjQ5NCwwLjU0MSwwLjcyNiwwLjgyNUwzNS42MjYsMTguNTUyeiBNMzcuNzg0LDIxLjQxNEwzNy41LDIxLjQ1M3YtMC42NDhsMC4wOTItMC4xMDQNCgkJCWMwLjEyMSwwLjIzNiwwLjIzNiwwLjQ3NywwLjM0NCwwLjcyTDM3Ljc4NCwyMS40MTR6IE0zOC43NTUsMjQuMDQzbDAuMDQ3LTAuMDU1YzAuMDIxLDAuMDg0LDAuMDM5LDAuMTY2LDAuMDYsMC4yNTENCgkJCUwzOC43NTUsMjQuMDQzeiIvPg0KCQk8cGF0aCBkPSJNMjAuOCwxNS43NTRsLTAuMjA5LDAuMDEzYy0wLjY5OCwwLjg0Ny0xLjUwOCwxLjYwNS0yLjQ0MSwyLjIxNmMtMC4xMDQsMC4xNjMtMC4yMTIsMC4zMzktMC4zMjEsMC41MTdsMC4xNDUsMC4wMzQNCgkJCWwtMC4xMjEsMC40NjhsLTAuMzc1LDAuMTE4bC0wLjAxMS0wLjAyM2MtMC43OTksMS4zMzEtMS42MjUsMi43OTUtMS45MzksMy4zNTdsLTAuODQ2LDEuNTI0bC0xLjEyNiwyLjAyOGwwLjA5NCwwLjE0NA0KCQkJbDEuMjgyLDAuMzE3di0wLjIwN2wwLjUxMiwwLjA3M0wxNS4zOTUsMjYuN2wwLjQwMywwLjA3MmwwLjYyMiwwLjE3bDAuODc4LDEuMDAzbDEuMTIzLDAuMDg0bDAuMTEsMC45MTZsLTAuNzY5LDAuNTM2DQoJCQlsLTAuMDM2LDAuODE3bC0wLjExLDAuNTAxbDEuMTEsMS4zOTFsMC4wODUsMC40NzhjMCwwLDAuNDAzLDAuMTA4LDAuNDUyLDAuMTA4YzAuMDQ4LDAsMC45MDMsMC42NDYsMC45MDMsMC42NDZ2Mi41MTQNCgkJCWwwLjMwNSwwLjA4NmwtMC4yMDgsMS4xNTlsMC41MTIsMC42ODVsLTAuMDk0LDEuMTQ4bDAuNjc3LDEuMTlsMC44NywwLjc1OWwwLjg3NCwwLjAxN2wwLjA4NS0wLjI4bC0wLjY0My0wLjU0MWwwLjAzOC0wLjI2OQ0KCQkJbDAuMTE1LTAuMzNsMC4wMjQtMC4zMzVsLTAuNDM0LTAuMDEybC0wLjIxOS0wLjI3NmwwLjM2MS0wLjM0OGwwLjA0OC0wLjI2MmwtMC40MDItMC4xMTZsMC4wMjQtMC4yNDNsMC41NzQtMC4wODdsMC44NzMtMC40Mg0KCQkJbDAuMjkzLTAuNTM3bDAuOTE2LTEuMTdsLTAuMjA4LTAuOTE3bDAuMjgyLTAuNDg4bDAuODQyLDAuMDI1bDAuNTY3LTAuNDQ4bDAuMTgzLTEuNzY3bDAuNjI5LTAuNzk5bDAuMTA5LTAuNTE0bC0wLjU3My0wLjE4NA0KCQkJbC0wLjM3OS0wLjYyMWwtMS4yOTUtMC4wMTFsLTEuMDI1LTAuMzkybC0wLjA0OC0wLjczbC0wLjM0Mi0wLjZsLTAuOTI3LTAuMDEzbC0wLjUzOC0wLjg0MmwtMC40NzYtMC4yMzFsLTAuMDIzLDAuMjU3DQoJCQlsLTAuODY2LDAuMDUybC0wLjMxNy0wLjQ0MmwtMC45MDMtMC4xODNsLTAuNzQ1LDAuODU5bC0xLjE3MS0wLjE5OGwtMC4wODYtMS4zMTlsLTAuODU0LTAuMTQ2bDAuMzQyLTAuNjQ2bC0wLjA5OS0wLjM3NQ0KCQkJbC0xLjEyMywwLjc1MmwtMC43MDctMC4wODdsLTAuMjUxLTAuNTUybDAuMTU1LTAuNTY5bDAuMzg5LTAuNzE4bDAuODk2LTAuNDU0bDEuNzMyLTAuMDAxbC0wLjAwNSwwLjUyOGwwLjYyMywwLjI5bC0wLjA1LTAuOTAxDQoJCQlsMC40NDktMC40NTFsMC45MDYtMC41OTVsMC4wNjItMC40MTlsMC45MDMtMC45NGwwLjk2LTAuNTMxbC0wLjA4NC0wLjA2OWwwLjY1LTAuNjEybDAuMjM4LDAuMDYzbDAuMTA5LDAuMTM3bDAuMjQ3LTAuMjczDQoJCQlsMC4wNjEtMC4wMjZsLTAuMjcxLTAuMDM5bC0wLjI3NC0wLjA5di0wLjI2NmwwLjE0Ni0wLjEyaDAuMzIybDAuMTQ2LDAuMDY0bDAuMTI3LDAuMjU3bDAuMTU1LTAuMDIzdi0wLjAyNWwwLjA0NSwwLjAxNQ0KCQkJbDAuNDUtMC4wNjlsMC4wNjMtMC4yMjFsMC4yNTYsMC4wNjR2MC4yMzhsLTAuMjM4LDAuMTY0aDAuMDAxbDAuMDM0LDAuMjYybDAuODE1LDAuMjUyYzAsMCwwLDAuMDAzLDAuMDAxLDAuMDFsMC4xODgtMC4wMTcNCgkJCWwwLjAxMy0wLjM1M2wtMC42NDYtMC4yOTVsLTAuMDM2LTAuMTdsMC41MzctMC4xODNsMC4wMjItMC41MTNsLTAuNTYxLTAuMzQybC0wLjAzNy0wLjg2NWwtMC43NywwLjM3N2gtMC4yOGwwLjA3NC0wLjY1OA0KCQkJbC0xLjA0OC0wLjI0OGwtMC40MzMsMC4zMjZ2MC45OThsLTAuNzc4LDAuMjQ3bC0wLjMxLDAuNjUxbC0wLjMzOCwwLjA1NXYtMC44MzFsLTAuNzMyLTAuMTAybC0wLjM2NS0wLjIzOGwtMC4xNDgtMC41MzkNCgkJCWwxLjMxLTAuNzY2bDAuNjQtMC4xOTZsMC4wNjQsMC40MzJsMC4zNTctMC4wMmwwLjAyOC0wLjIxNmwwLjM3My0wLjA1NGwwLjAwNi0wLjA3NmwtMC4xNi0wLjA2NmwtMC4wMzctMC4yMjhsMC40NTgtMC4wMzkNCgkJCWwwLjI3Ny0wLjI4OWwwLjAxNS0wLjAyMWwwLjAwMywwLjAwMmwwLjA4NC0wLjA4OGwwLjk2Ni0wLjEybDAuNDI3LDAuMzYybC0xLjExOCwwLjU5NWwxLjQyMiwwLjMzNmwwLjE4NC0wLjQ3NmgwLjYyM2wwLjIyLTAuNDE1DQoJCQlsLTAuNDM4LTAuMTFWMTUuNDVsLTEuMzc5LTAuNjFsLTAuOTUzLDAuMTFsLTAuNTM2LDAuMjhsMC4wMzcsMC42ODRsLTAuNTYxLTAuMDg2TDIxLjM1LDE1LjQ1bDAuNTM4LTAuNDg4bC0wLjY0OC0wLjAzMQ0KCQkJYy0wLjExMywwLjE2Ny0wLjI0NywwLjMxOC0wLjM2OSwwLjQ3OUwyMC44LDE1Ljc1NHogTTE4LjI3NCwyMS4wMjJsLTAuMjU2LTAuMTM2bDAuMDU1LTAuMzY2bDAuMzM4LTAuMzY1aDAuNDg1TDE4LjI3NCwyMS4wMjJ6DQoJCQkgTTE5LjU3NCwyMS4wMjJsLTAuMjEsMC4yMTFoLTAuNDY3bDAuMDcyLTAuMzE5bDAuMjItMC4wMTlsMC4wNDYtMC4xMWwwLjMzOC0wLjA0NkwxOS41NzQsMjEuMDIyTDE5LjU3NCwyMS4wMjJ6IE0xOS42ODQsMjAuNDQ3DQoJCQlsLTAuMjIsMC4xNDJsLTAuMjc0LDAuMDUxYzAsMCwwLTAuNDM5LDAtMC40ODRoMC40OTRWMjAuNDQ3eiBNMjAuMSwyMC4xMDhsMC4yMjUsMC4xNDFsLTAuMTgsMC4xNDhsLTAuMTc3LTAuMTQ4TDIwLjEsMjAuMTA4eg0KCQkJIE0xOS44MDMsMjAuNDc0aDAuMDM3bDAuNTU4LDAuMTY1djAuMjg0aC0wLjQ2N2wtMC4xMjctMC4xODVMMTkuODAzLDIwLjQ3NEwxOS44MDMsMjAuNDc0eiBNMTkuNDM2LDE5LjY4NmwwLjMwMywwLjI3Ng0KCQkJbC0wLjMwMywwLjA3MlYxOS42ODZ6IE0xOS4xNTMsMTkuNTU5djAuMTc0aDAuMTI3djAuMzAyaC0wLjg3N2wtMC4zMjktMC4wOTJsMC4wODEtMC4yMWwwLjQyMi0wLjE3NEgxOS4xNTN6Ii8+DQoJCTxwYXRoIGQ9Ik0xMi42NjksMjMuMjg1bDAuODQ3LTEuNTI0YzAuMDE5LTAuMDMzLDEuNzgxLTMuMiwyLjkzMS00Ljk2YzIuODk1LTEuNzA1LDQuNjI4LTQuOTMzLDQuNDM0LTguMw0KCQkJYy0wLjI4NS00Ljk0MS00LjUyMi04Ljc2My05LjUyOS04LjQ4NkM2LjM4NywwLjMwMiwyLjU4LDQuNTc2LDIuODY3LDkuNTQyYzAuMTk1LDMuMzU2LDIuMTkyLDYuMjc2LDUuMjMzLDcuNjc2DQoJCQljMS43NDgsMS45MDMsMy41NzQsNC41OTQsMy41OTMsNC42MjJMMTIuNjY5LDIzLjI4NXogTTkuMzY0LDE1LjQzMWwtMC4yMDUtMC4wODhjLTIuNDEtMS4wMzYtNC0zLjMwNy00LjE1Mi01LjkyNQ0KCQkJYy0wLjIxOS0zLjc4NywyLjY4My03LjA0Niw2LjQ2OS03LjI2NWMwLjEzNS0wLjAwOCwwLjI3MS0wLjAxMiwwLjQwNS0wLjAxMmMzLjYzNywwLDYuNjQ5LDIuODQ3LDYuODU5LDYuNDgxDQoJCQljMC4xNTIsMi42MzctMS4yNDYsNS4xNjEtMy41NjIsNi40MzJsLTAuMjI5LDAuMTI2bC0wLjE0NiwwLjIxOGMtMC43MDMsMS4wNTItMS42NTEsMi42NjYtMi4zMjUsMy44NDMNCgkJCWMtMC43NjQtMS4wNDUtMS44NzEtMi40ODUtMi45NjEtMy42NDdMOS4zNjQsMTUuNDMxeiIvPg0KCQk8Y2lyY2xlIGN4PSIxMS44NzMiIGN5PSI4Ljg5MiIgcj0iMy41NDkiLz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4=" class=" h-16 logo" alt="More Real Estate Logo" style="filter: brightness(0) invert(1); " />
      <div class="flex flex-col items-center ml-2">
        <div class="flex items-center">
          <div class="border-l-2 h-10 border-white mx-2"></div> <!-- Увеличенная вертикальная черта -->
          <span class="text-3xl font-thin text-white align-middle">SRE</span>
        </div>
        <span class="mre text-xs uppercase text-white mt-2">sea real estate</span> <!-- Исправлено расположение текста -->
      </div>
    </a>
  </div>


    <div class="container">

      <svg class="loader" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 340">
        <circle cx="170" cy="170" r="160" stroke="#E2007C"/>
        <circle cx="170" cy="170" r="135" stroke="#404041"/>
        <circle cx="170" cy="170" r="110" stroke="#E2007C"/>
        <circle cx="170" cy="170" r="85" stroke="#404041"/>
      </svg>

    </div>


  </div>



<style>
    .container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        min-width: 100%;
        background-color: rgb(var(--color-surface-900));
        background-image: radial-gradient(at 100% 0%, rgba(var(--color-secondary-500) / 0.33) 0px, transparent 50%), radial-gradient(at 2% 1%, rgba(var(--color-error-500) / 0.33) 0px, transparent 50%);
        overflow-x: hidden;
    }
    .logotype {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        transform:scale(0.5);
    }
    .logotype img {
    	margin-bottom: 50px; /* Отступ для логотипа */
    margin-right: -20px;
    margin-left: -10px;

    }
    .loader {
        max-width: 15rem;
        width: 100%;
        height: auto;
        stroke-linecap: round;
    }

    circle {
        fill: none;
        stroke-width: 3.5;
        animation-name: preloader;
        animation-duration: 3s;
        animation-iteration-count: infinite;
        animation-timing-function: ease-in-out;
        transform-origin: 170px 170px;
        will-change: transform;
    }

    circle:nth-of-type(1) {
        stroke-dasharray: 550px;
        animation-delay: -0.15s;
    }

    circle:nth-of-type(2) {
        stroke-dasharray: 500px;
        animation-delay: -0.3s;
    }

    circle:nth-of-type(3) {
        stroke-dasharray: 450px;
        animation-delay: -0.45s;
    }

    circle:nth-of-type(4) {
        stroke-dasharray: 300px;
        animation-delay: -0.6s;
    }

    @keyframes preloader {
        50% {
            transform: rotate(360deg);
        }
    }
    .loaded {
        animation: fadeOutPage 2s ease-out forwards;
    }

    @keyframes fadeOutPage {
        from {
            opacity: 1;
            visibility: visible;
        }
        to {
            opacity: 0;
            visibility: hidden;
        }
    }
    @media (max-width: 440px) {
        .logotype {
            margin-top: 50px;
        }


    }
</style>