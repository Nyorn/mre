
<script>
	
	let isDropdownOpen = false;

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}
</script>

<nav class="bg-white dark:bg-gray-900 w-full top-0 start-0 border-b border-gray-200 dark:border-gray-600">
	<div class="mx-auto p-4 py-6 lg:py-8" style="padding-right:10%;padding-left:10%">
		<div class="flex flex-col md:flex-row justify-between items-center">
			<!-- Лого, вертикальная черта и название компании -->
			<div class="mb-6 md:mb-0 flex items-center">
				<a href="https://sea-estate.com/" class="flex items-center">
					<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBVcGxvYWRlZCB0bzogU1ZHIFJlcG8sIHd3dy5zdmdyZXBvLmNvbSwgR2VuZXJhdG9yOiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIGZpbGw9IiMwMDAwMDAiIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgDQoJIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDQzLjM2NCA0My4zNjQiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxwb2x5Z29uIHBvaW50cz0iMzEuNDU4LDE5LjMgMzEuODg2LDE5LjMgMzIuNDUzLDE5LjI0NSAzMi43NDYsMTguODk3IDMyLjQzNSwxOC43NzYgMzIuMjY1LDE4LjU3OSAzMi4wMDgsMTguMTY1IDMxLjg4NiwxNy41NzkgDQoJCQkzMS40MDUsMTcuNjc3IDMxLjI2OSwxNy44ODMgMzEuMjY5LDE4LjExNiAzMS41MDEsMTguMjc1IDMxLjgzMSwxOC40ODMgMzEuODYxLDE4LjcyIDMxLjUwNywxOC43OTMgCQkiLz4NCgkJPHBvbHlnb24gcG9pbnRzPSIzMC43NywxOC4zMjkgMzAuNDc3LDE4Ljc5OSAzMC40NzcsMTkuMTA0IDMwLjgxOCwxOS4xMDQgMzEuNDIyLDE4LjY3NyAzMS40NDcsMTguMzYgMzEuMTY0LDE4LjIzOCAJCSIvPg0KCQk8cGF0aCBkPSJNMjMuMjA3LDIwLjI0OGgtMC40MjF2MC4yMTZoMC4xMDJjMCwwLDAuMDA1LDAuMDQ3LDAuMDE1LDAuMTA2bDAuMjU3LTAuMDIxbDAuMTYyLTAuMWwwLjA0Mi0wLjIwMmwwLjIwOS0wLjAxOQ0KCQkJbDAuMDgyLTAuMTdsLTAuMTkxLTAuMDM5bC0wLjE2NywwLjAwM0wyMy4yMDcsMjAuMjQ4eiIvPg0KCQk8cG9seWdvbiBwb2ludHM9IjIyLjE5MywyMC42MyAyMi40OTgsMjAuNjA1IDIyLjUzMSwyMC4zOTIgMjIuMzQ2LDIwLjI0OCAyMi4yMDksMjAuNDE5IAkJIi8+DQoJCTxwYXRoIGQ9Ik00MC41MSwyNy4yYy0wLjAwNS0wLjQ2OS0wLjAyOS0wLjkzMy0wLjA3My0xLjM5MWMtMC4xNDYtMS41MjQtMC41MTMtMi45ODUtMS4wNi00LjM1NQ0KCQkJYy0wLjA0MS0wLjEwMy0wLjA3OS0wLjIwNi0wLjEyLTAuMzA3Yy0wLjcyOS0xLjcyLTEuNzUyLTMuMjg0LTMuMDAyLTQuNjM2Yy0wLjA4Mi0wLjA4OS0wLjE2NS0wLjE3NS0wLjI0OS0wLjI2Mg0KCQkJYy0wLjIzNy0wLjI0NC0wLjQ3OC0wLjQ4NC0wLjczMS0wLjcxNGMtMi44NDQtMi41OS02LjYyMS00LjE3MS0xMC43NjItNC4xNzFjLTAuNTg1LDAtMS4xNiwwLjAzOS0xLjcyOSwwLjEwMQ0KCQkJYy0wLjEyMywwLjQ3My0wLjI3NiwwLjkzNC0wLjQ1OSwxLjM4NWMwLjcxNS0wLjEwNywxLjQ0NC0wLjE2OSwyLjE4OC0wLjE2OWMzLjcxMiwwLDcuMTA2LDEuMzg4LDkuNjk0LDMuNjY4bC0wLjE3NCwwLjMxMw0KCQkJbC0wLjY3OSwwLjI2NWwtMC4yODMsMC4zMWwwLjA2NCwwLjM2MmwwLjM1LDAuMDQ4bDAuMjEyLDAuNTI2bDAuNjAyLTAuMjQybDAuMSwwLjcwNGgtMC4xODJsLTAuNDk2LTAuMDczbC0wLjU0OCwwLjA5Mg0KCQkJbC0wLjUzMSwwLjc1bC0wLjc1OSwwLjEybC0wLjExLDAuNjQ5bDAuMzIsMC4wNzZsLTAuMDkyLDAuNDE4bC0wLjc1NS0wLjE1MmwtMC42OTIsMC4xNTJsLTAuMTQ2LDAuMzg0bDAuMTE5LDAuODA5bDAuNDA1LDAuMTg5DQoJCQlsMC42ODItMC4wMDRsMC40NTktMC4wNDJsMC4xNDItMC4zNjVsMC43MTctMC45MzVsMC40NzUsMC4wOTdsMC40NjYtMC40MjFsMC4wODYsMC4zMjlsMS4xNDYsMC43NzJsLTAuMTQsMC4xODhsLTAuNTE3LTAuMDI4DQoJCQlsMC4xOTgsMC4yODJsMC4zMTgsMC4wN2wwLjM3My0wLjE1NWwtMC4wMDctMC40NDlsMC4xNjYtMC4wODNsLTAuMTMzLTAuMTQxTDM0LjYsMjAuNzM4bC0wLjIwMi0wLjU2NmgwLjYzN2wwLjIwMiwwLjIwMQ0KCQkJbDAuNTQ4LDAuNDcybDAuMDIyLDAuNTdsMC41NjcsMC42MDRsMC4yMTEtMC44MjhsMC4zOTMtMC4yMTNsMC4wNzMsMC42NzdsMC4zODQsMC40MjJsMC43NjYtMC4wMTUNCgkJCWMwLjE0NywwLjM4MSwwLjI4LDAuNzcsMC4zOTYsMS4xNjRsLTAuMDgyLDAuMDc1aC0xLjE3MUwzNi42MywyMi43N2wtMC43NSwwLjA3MnYwLjQ1OWgtMC4yMzlsLTAuMjU1LTAuMTg0bC0xLjMtMC4zMjl2LTAuODQyDQoJCQlsLTEuNjQ3LDAuMTI5bC0wLjUxMiwwLjI3MmgtMC42NTRsLTAuMzItMC4wMzJsLTAuNzk0LDAuNDQxdjAuODI5bC0xLjYyMiwxLjE3MmwwLjEzNCwwLjVIMjlsLTAuMDg3LDAuNDc3bC0wLjIzMSwwLjA4OA0KCQkJbC0wLjAxMiwxLjI0NGwxLjQwMywxLjU5OWgwLjYwOWwwLjAzOC0wLjA5OWgxLjA5OWwwLjMxNS0wLjI5MmgwLjYyNGwwLjM0MSwwLjM0MmwwLjkyOCwwLjA5OGwtMC4xMjMsMS4yMzJsMS4wMywxLjgxNw0KCQkJbC0wLjU0MiwxLjAzN2wwLjAzNywwLjQ4OGwwLjQyOCwwLjQyN3YxLjE3NGwwLjU2MSwwLjc1NXYwLjk3N2gwLjQ4NWMtMi42OTUsMy4zMS02LjgsNS40MjktMTEuMzksNS40MjkNCgkJCWMtOC4wOTcsMC0xNC42ODQtNi41ODgtMTQuNjg0LTE0LjY4NWMwLTEuNTI2LDAuMjM1LTIuOTk5LDAuNjY5LTQuMzg1bC0wLjIwMS0wLjI5OGMtMC4wNjctMC4wOTktMC4zMzQtMC40ODYtMC43MTktMS4wMg0KCQkJYy0wLjY4MSwxLjc3Mi0xLjA2NSwzLjY5LTEuMDY1LDUuNzAxYzAsOC44MjIsNy4xNzgsMTYsMTYsMTZjNi4yMDYsMCwxMS41OTQtMy41NTUsMTQuMjQ2LTguNzMNCgkJCWMwLjU2Ny0xLjEwNywxLjAwOS0yLjI4OCwxLjMwNy0zLjUyMmMwLjA3NS0wLjMxMywwLjE0MS0wLjYzMSwwLjE5Ny0wLjk0OWMwLjE2MS0wLjkwOSwwLjI0OS0xLjg0MywwLjI0OS0yLjc5Nw0KCQkJQzQwLjUxMywyNy4zMDksNDAuNTExLDI3LjI1NCw0MC41MSwyNy4yeiBNMzUuNjI2LDE4LjU1MmwtMS4wMDctMC4wMDlsLTAuMDYzLTAuMjFsMC42MzEtMC4zMjFsMC4wMDMtMC43MTQNCgkJCWMwLjI1MSwwLjI2NiwwLjQ5NCwwLjU0MSwwLjcyNiwwLjgyNUwzNS42MjYsMTguNTUyeiBNMzcuNzg0LDIxLjQxNEwzNy41LDIxLjQ1M3YtMC42NDhsMC4wOTItMC4xMDQNCgkJCWMwLjEyMSwwLjIzNiwwLjIzNiwwLjQ3NywwLjM0NCwwLjcyTDM3Ljc4NCwyMS40MTR6IE0zOC43NTUsMjQuMDQzbDAuMDQ3LTAuMDU1YzAuMDIxLDAuMDg0LDAuMDM5LDAuMTY2LDAuMDYsMC4yNTENCgkJCUwzOC43NTUsMjQuMDQzeiIvPg0KCQk8cGF0aCBkPSJNMjAuOCwxNS43NTRsLTAuMjA5LDAuMDEzYy0wLjY5OCwwLjg0Ny0xLjUwOCwxLjYwNS0yLjQ0MSwyLjIxNmMtMC4xMDQsMC4xNjMtMC4yMTIsMC4zMzktMC4zMjEsMC41MTdsMC4xNDUsMC4wMzQNCgkJCWwtMC4xMjEsMC40NjhsLTAuMzc1LDAuMTE4bC0wLjAxMS0wLjAyM2MtMC43OTksMS4zMzEtMS42MjUsMi43OTUtMS45MzksMy4zNTdsLTAuODQ2LDEuNTI0bC0xLjEyNiwyLjAyOGwwLjA5NCwwLjE0NA0KCQkJbDEuMjgyLDAuMzE3di0wLjIwN2wwLjUxMiwwLjA3M0wxNS4zOTUsMjYuN2wwLjQwMywwLjA3MmwwLjYyMiwwLjE3bDAuODc4LDEuMDAzbDEuMTIzLDAuMDg0bDAuMTEsMC45MTZsLTAuNzY5LDAuNTM2DQoJCQlsLTAuMDM2LDAuODE3bC0wLjExLDAuNTAxbDEuMTEsMS4zOTFsMC4wODUsMC40NzhjMCwwLDAuNDAzLDAuMTA4LDAuNDUyLDAuMTA4YzAuMDQ4LDAsMC45MDMsMC42NDYsMC45MDMsMC42NDZ2Mi41MTQNCgkJCWwwLjMwNSwwLjA4NmwtMC4yMDgsMS4xNTlsMC41MTIsMC42ODVsLTAuMDk0LDEuMTQ4bDAuNjc3LDEuMTlsMC44NywwLjc1OWwwLjg3NCwwLjAxN2wwLjA4NS0wLjI4bC0wLjY0My0wLjU0MWwwLjAzOC0wLjI2OQ0KCQkJbDAuMTE1LTAuMzNsMC4wMjQtMC4zMzVsLTAuNDM0LTAuMDEybC0wLjIxOS0wLjI3NmwwLjM2MS0wLjM0OGwwLjA0OC0wLjI2MmwtMC40MDItMC4xMTZsMC4wMjQtMC4yNDNsMC41NzQtMC4wODdsMC44NzMtMC40Mg0KCQkJbDAuMjkzLTAuNTM3bDAuOTE2LTEuMTdsLTAuMjA4LTAuOTE3bDAuMjgyLTAuNDg4bDAuODQyLDAuMDI1bDAuNTY3LTAuNDQ4bDAuMTgzLTEuNzY3bDAuNjI5LTAuNzk5bDAuMTA5LTAuNTE0bC0wLjU3My0wLjE4NA0KCQkJbC0wLjM3OS0wLjYyMWwtMS4yOTUtMC4wMTFsLTEuMDI1LTAuMzkybC0wLjA0OC0wLjczbC0wLjM0Mi0wLjZsLTAuOTI3LTAuMDEzbC0wLjUzOC0wLjg0MmwtMC40NzYtMC4yMzFsLTAuMDIzLDAuMjU3DQoJCQlsLTAuODY2LDAuMDUybC0wLjMxNy0wLjQ0MmwtMC45MDMtMC4xODNsLTAuNzQ1LDAuODU5bC0xLjE3MS0wLjE5OGwtMC4wODYtMS4zMTlsLTAuODU0LTAuMTQ2bDAuMzQyLTAuNjQ2bC0wLjA5OS0wLjM3NQ0KCQkJbC0xLjEyMywwLjc1MmwtMC43MDctMC4wODdsLTAuMjUxLTAuNTUybDAuMTU1LTAuNTY5bDAuMzg5LTAuNzE4bDAuODk2LTAuNDU0bDEuNzMyLTAuMDAxbC0wLjAwNSwwLjUyOGwwLjYyMywwLjI5bC0wLjA1LTAuOTAxDQoJCQlsMC40NDktMC40NTFsMC45MDYtMC41OTVsMC4wNjItMC40MTlsMC45MDMtMC45NGwwLjk2LTAuNTMxbC0wLjA4NC0wLjA2OWwwLjY1LTAuNjEybDAuMjM4LDAuMDYzbDAuMTA5LDAuMTM3bDAuMjQ3LTAuMjczDQoJCQlsMC4wNjEtMC4wMjZsLTAuMjcxLTAuMDM5bC0wLjI3NC0wLjA5di0wLjI2NmwwLjE0Ni0wLjEyaDAuMzIybDAuMTQ2LDAuMDY0bDAuMTI3LDAuMjU3bDAuMTU1LTAuMDIzdi0wLjAyNWwwLjA0NSwwLjAxNQ0KCQkJbDAuNDUtMC4wNjlsMC4wNjMtMC4yMjFsMC4yNTYsMC4wNjR2MC4yMzhsLTAuMjM4LDAuMTY0aDAuMDAxbDAuMDM0LDAuMjYybDAuODE1LDAuMjUyYzAsMCwwLDAuMDAzLDAuMDAxLDAuMDFsMC4xODgtMC4wMTcNCgkJCWwwLjAxMy0wLjM1M2wtMC42NDYtMC4yOTVsLTAuMDM2LTAuMTdsMC41MzctMC4xODNsMC4wMjItMC41MTNsLTAuNTYxLTAuMzQybC0wLjAzNy0wLjg2NWwtMC43NywwLjM3N2gtMC4yOGwwLjA3NC0wLjY1OA0KCQkJbC0xLjA0OC0wLjI0OGwtMC40MzMsMC4zMjZ2MC45OThsLTAuNzc4LDAuMjQ3bC0wLjMxLDAuNjUxbC0wLjMzOCwwLjA1NXYtMC44MzFsLTAuNzMyLTAuMTAybC0wLjM2NS0wLjIzOGwtMC4xNDgtMC41MzkNCgkJCWwxLjMxLTAuNzY2bDAuNjQtMC4xOTZsMC4wNjQsMC40MzJsMC4zNTctMC4wMmwwLjAyOC0wLjIxNmwwLjM3My0wLjA1NGwwLjAwNi0wLjA3NmwtMC4xNi0wLjA2NmwtMC4wMzctMC4yMjhsMC40NTgtMC4wMzkNCgkJCWwwLjI3Ny0wLjI4OWwwLjAxNS0wLjAyMWwwLjAwMywwLjAwMmwwLjA4NC0wLjA4OGwwLjk2Ni0wLjEybDAuNDI3LDAuMzYybC0xLjExOCwwLjU5NWwxLjQyMiwwLjMzNmwwLjE4NC0wLjQ3NmgwLjYyM2wwLjIyLTAuNDE1DQoJCQlsLTAuNDM4LTAuMTFWMTUuNDVsLTEuMzc5LTAuNjFsLTAuOTUzLDAuMTFsLTAuNTM2LDAuMjhsMC4wMzcsMC42ODRsLTAuNTYxLTAuMDg2TDIxLjM1LDE1LjQ1bDAuNTM4LTAuNDg4bC0wLjY0OC0wLjAzMQ0KCQkJYy0wLjExMywwLjE2Ny0wLjI0NywwLjMxOC0wLjM2OSwwLjQ3OUwyMC44LDE1Ljc1NHogTTE4LjI3NCwyMS4wMjJsLTAuMjU2LTAuMTM2bDAuMDU1LTAuMzY2bDAuMzM4LTAuMzY1aDAuNDg1TDE4LjI3NCwyMS4wMjJ6DQoJCQkgTTE5LjU3NCwyMS4wMjJsLTAuMjEsMC4yMTFoLTAuNDY3bDAuMDcyLTAuMzE5bDAuMjItMC4wMTlsMC4wNDYtMC4xMWwwLjMzOC0wLjA0NkwxOS41NzQsMjEuMDIyTDE5LjU3NCwyMS4wMjJ6IE0xOS42ODQsMjAuNDQ3DQoJCQlsLTAuMjIsMC4xNDJsLTAuMjc0LDAuMDUxYzAsMCwwLTAuNDM5LDAtMC40ODRoMC40OTRWMjAuNDQ3eiBNMjAuMSwyMC4xMDhsMC4yMjUsMC4xNDFsLTAuMTgsMC4xNDhsLTAuMTc3LTAuMTQ4TDIwLjEsMjAuMTA4eg0KCQkJIE0xOS44MDMsMjAuNDc0aDAuMDM3bDAuNTU4LDAuMTY1djAuMjg0aC0wLjQ2N2wtMC4xMjctMC4xODVMMTkuODAzLDIwLjQ3NEwxOS44MDMsMjAuNDc0eiBNMTkuNDM2LDE5LjY4NmwwLjMwMywwLjI3Ng0KCQkJbC0wLjMwMywwLjA3MlYxOS42ODZ6IE0xOS4xNTMsMTkuNTU5djAuMTc0aDAuMTI3djAuMzAyaC0wLjg3N2wtMC4zMjktMC4wOTJsMC4wODEtMC4yMWwwLjQyMi0wLjE3NEgxOS4xNTN6Ii8+DQoJCTxwYXRoIGQ9Ik0xMi42NjksMjMuMjg1bDAuODQ3LTEuNTI0YzAuMDE5LTAuMDMzLDEuNzgxLTMuMiwyLjkzMS00Ljk2YzIuODk1LTEuNzA1LDQuNjI4LTQuOTMzLDQuNDM0LTguMw0KCQkJYy0wLjI4NS00Ljk0MS00LjUyMi04Ljc2My05LjUyOS04LjQ4NkM2LjM4NywwLjMwMiwyLjU4LDQuNTc2LDIuODY3LDkuNTQyYzAuMTk1LDMuMzU2LDIuMTkyLDYuMjc2LDUuMjMzLDcuNjc2DQoJCQljMS43NDgsMS45MDMsMy41NzQsNC41OTQsMy41OTMsNC42MjJMMTIuNjY5LDIzLjI4NXogTTkuMzY0LDE1LjQzMWwtMC4yMDUtMC4wODhjLTIuNDEtMS4wMzYtNC0zLjMwNy00LjE1Mi01LjkyNQ0KCQkJYy0wLjIxOS0zLjc4NywyLjY4My03LjA0Niw2LjQ2OS03LjI2NWMwLjEzNS0wLjAwOCwwLjI3MS0wLjAxMiwwLjQwNS0wLjAxMmMzLjYzNywwLDYuNjQ5LDIuODQ3LDYuODU5LDYuNDgxDQoJCQljMC4xNTIsMi42MzctMS4yNDYsNS4xNjEtMy41NjIsNi40MzJsLTAuMjI5LDAuMTI2bC0wLjE0NiwwLjIxOGMtMC43MDMsMS4wNTItMS42NTEsMi42NjYtMi4zMjUsMy44NDMNCgkJCWMtMC43NjQtMS4wNDUtMS44NzEtMi40ODUtMi45NjEtMy42NDdMOS4zNjQsMTUuNDMxeiIvPg0KCQk8Y2lyY2xlIGN4PSIxMS44NzMiIGN5PSI4Ljg5MiIgcj0iMy41NDkiLz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4=" class=" h-16 logo" alt="More Real Estate Logo" style="filter: brightness(0) invert(1); " />
					<div class="flex flex-col items-center ml-2">
						<div class="flex items-center">
							<div class="border-l-2 h-8 border-white mx-2"></div> <!-- Увеличенная вертикальная черта -->
							<span class="text-3xl font-thin text-white align-middle">MRE</span>
						</div>
						<span class="mre text-xs uppercase text-white mt-4">more real estate</span> <!-- Исправлено расположение текста -->
					</div>
				</a>
			</div>
			<div class="relative items-center md:order-2 space-x-1 md:space-x-8 rtl:space-x-reverse">
				<button type="button" on:click={toggleDropdown} class="inline-flex items-center font-medium justify-center px-4 py-2 text-sm text-gray-900 dark:text-white rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white">
				<svg class="w-5 h-5 rounded-full me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 3900 3900"><path fill="#b22234" d="M0 0h7410v3900H0z"/><path d="M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0" stroke="#fff" stroke-width="300"/><path fill="#3c3b6e" d="M0 0h2964v2100H0z"/><g fill="#fff"><g id="d"><g id="c"><g id="e"><g id="b"><path id="a" d="M247 90l70.534 217.082-184.66-134.164h228.253L176.466 307.082z"/><use xlink:href="#a" y="420"/><use xlink:href="#a" y="840"/><use xlink:href="#a" y="1260"/></g><use xlink:href="#a" y="1680"/></g><use xlink:href="#b" x="247" y="210"/></g><use xlink:href="#c" x="494"/></g><use xlink:href="#d" x="988"/><use xlink:href="#c" x="1976"/><use xlink:href="#e" x="2470"/></g></svg>
				English (US)
			</button>
			<!-- Dropdown -->
				<div class="{isDropdownOpen ? 'block' : 'hidden'} absolute z-50 mt-1 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700" id="language-dropdown-menu" style="min-width: 100%;">
				<ul class="py-2 font-medium" role="none">
					<li>
						<a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
							<div class="inline-flex items-center">
								<svg aria-hidden="true" class="h-3.5 w-3.5 rounded-full me-2" xmlns="http://www.w3.org/2000/svg" id="flag-icon-css-us" viewBox="0 0 512 512"><g fill-rule="evenodd"><g stroke-width="1pt"><path fill="#bd3d44" d="M0 0h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0z" transform="scale(3.9385)"/><path fill="#fff" d="M0 10h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0zm0 20h247v10H0z" transform="scale(3.9385)"/></g><path fill="#192f5d" d="M0 0h98.8v70H0z" transform="scale(3.9385)"/><path fill="#fff" d="M8.2 3l1 2.8H12L9.7 7.5l.9 2.7-2.4-1.7L6 10.2l.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8H45l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7L74 8.5l-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9L92 7.5l1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm-74.1 7l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7H65zm16.4 0l1 2.8H86l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm-74 7l.8 2.8h3l-2.4 1.7.9 2.7-2.4-1.7L6 24.2l.9-2.7-2.4-1.7h3zm16.4 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8H45l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9L92 21.5l1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm-74.1 7l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7H65zm16.4 0l1 2.8H86l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm-74 7l.8 2.8h3l-2.4 1.7.9 2.7-2.4-1.7L6 38.2l.9-2.7-2.4-1.7h3zm16.4 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8H45l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9L92 35.5l1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm-74.1 7l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7H65zm16.4 0l1 2.8H86l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm-74 7l.8 2.8h3l-2.4 1.7.9 2.7-2.4-1.7L6 52.2l.9-2.7-2.4-1.7h3zm16.4 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8H45l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9L92 49.5l1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm-74.1 7l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7H65zm16.4 0l1 2.8H86l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm-74 7l.8 2.8h3l-2.4 1.7.9 2.7-2.4-1.7L6 66.2l.9-2.7-2.4-1.7h3zm16.4 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8H45l-2.4 1.7 1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9zm16.4 0l1 2.8h2.8l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h3zm16.5 0l.9 2.8h2.9l-2.3 1.7.9 2.7-2.4-1.7-2.3 1.7.9-2.7-2.4-1.7h2.9zm16.5 0l.9 2.8h2.9L92 63.5l1 2.7-2.4-1.7-2.4 1.7 1-2.7-2.4-1.7h2.9z" transform="scale(3.9385)"/></g></svg>
								English (US)
							</div>
						</a>
					</li>
					<li>
						<a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
							<div class="inline-flex items-center">
								<svg class="h-3.5 w-3.5 rounded-full me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" id="flag-icon-css-de" viewBox="0 0 512 512"><path fill="#ffce00" d="M0 341.3h512V512H0z"/><path d="M0 0h512v170.7H0z"/><path fill="#d00" d="M0 170.7h512v170.6H0z"/></svg>
								Deutsch
							</div>
						</a>
					</li>
					<li>
						<a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
							<div class="inline-flex items-center">
								<svg class="h-3.5 w-3.5 rounded-full me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" id="flag-icon-css-it" viewBox="0 0 512 512"><g fill-rule="evenodd" stroke-width="1pt"><path fill="#fff" d="M0 0h512v512H0z"/><path fill="#009246" d="M0 0h170.7v512H0z"/><path fill="#ce2b37" d="M341.3 0H512v512H341.3z"/></g></svg>
								Italiano
							</div>
						</a>
					</li>
					<li>
						<a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">
							<div class="inline-flex items-center">
								<svg class="h-3.5 w-3.5 rounded-full me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="flag-icon-css-cn" viewBox="0 0 512 512"><defs><path id="a" fill="#ffde00" d="M1-.3L-.7.8 0-1 .6.8-1-.3z"/></defs><path fill="#de2910" d="M0 0h512v512H0z"/><use width="30" height="20" transform="matrix(76.8 0 0 76.8 128 128)" xlink:href="#a"/><use width="30" height="20" transform="rotate(-121 142.6 -47) scale(25.5827)" xlink:href="#a"/><use width="30" height="20" transform="rotate(-98.1 198 -82) scale(25.6)" xlink:href="#a"/><use width="30" height="20" transform="rotate(-74 272.4 -114) scale(25.6137)" xlink:href="#a"/><use width="30" height="20" transform="matrix(16 -19.968 19.968 16 256 230.4)" xlink:href="#a"/></svg>
								中文 (繁體)
							</div>
						</a>
					</li>
				</ul>
			</div>
			<button data-collapse-toggle="navbar-language" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-language" aria-expanded="false">
				<span class="sr-only">Open main menu</span>
				<svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
				</svg>
			</button>
		</div>
		<div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-language">
			<ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
				<li>
					<a href="/" class="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500" aria-current="page">Главная</a>
				</li>
				<li>
					<a href="/objects" class="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Каталог</a>
				</li>
				<li>
					<a href="#" class="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">О нас</a>
				</li>
				<li>
					<a href="#" class="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Документы</a>
				</li>
				<li>
					<a href="#" class="block py-2 px-3 md:p-0 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Контакты</a>
				</li>
			</ul>
		</div>
	</div>
</nav>
<style>
	nav {

	}
	nav img {
		margin-bottom: 50px; /* Отступ для логотипа */
	margin-right: -25px;
	}
	.mre {
		margin-left: -25px;
	}
	#navbar-language {
		margin-left: auto;
	}
	#language-dropdown-menu {
		min-width: 100%; /* This makes the dropdown at least as wide as the button */
	}
	.md:space-x-8 > :last-child {
		margin-right: 2rem; /* Adjust the value as needed */
	}
	#navbar-language > ul > li:last-child {
		margin-right: 2rem; /* Adjust the value as needed */
	}
</style>
