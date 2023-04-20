// 最大数据量
const MAX_COUNT = 100;
// 操作延迟，单位秒
const HANDLE_DELAY = 2;
// 休息延迟，单位秒
const REST_DELAY = 1;


class Xhs {
    list = [];

    constructor() {
        setTimeout(() => {
            this.loop();
        }, HANDLE_DELAY * 1000);
    }

    // 睡眠
    async sleep(delay) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, delay * 1000);
        });
    }

    // 循环
    async loop() {
        if (this.list.length >= MAX_COUNT) {
            this.export();
            return;
        }
        try {
            await this.getList();
            if (!(this.list.length % 3)) {
                await this.sleep(REST_DELAY)
            }
            this.reload();
            this.loop();
        } catch (err) {
            console.error(err)
            this.export();
        }
    }

    // 获取列表
    async getList() {
        const elements = document.querySelectorAll(".note-item");
        for (let i = 0; i < elements.length; i++) {
            const item = elements[i];
            // 链接
            const link = item.querySelector("a").href;
            // 点赞数
            const like = item.querySelector(".like-wrapper .count").innerText;
            // 标题
            const title = item.querySelector(".footer span").innerText;

            // 进入详情页
            item.querySelectorAll("a")[1].click();
            await this.sleep(HANDLE_DELAY);

            // 正文
            let content = "";
            document
                .querySelectorAll(".desc")
                .forEach((item) => (content += item.innerText));
            // 日期
            const date = document.querySelector(".date").innerText;
            // 收藏数
            const collect = document.querySelector(
                ".collect-wrapper .count"
            ).innerText;
            document.querySelector(".close").click();
            await this.sleep(HANDLE_DELAY);

            // 添加到列表
            this.list.push({
                link,
                like,
                title,
                content,
                date,
                collect,
            });
            console.log(this.list);
        }
    }

    // 刷新页面
    reload() {
        document.querySelector(".reload").click();
    }

    // 导出
    export() {
        const xlsx =
            "https://cdn.bootcdn.net/ajax/libs/xlsx/0.16.9/xlsx.full.min.js";
        const script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", xlsx);
        script.onload = () => {
            const wb = XLSX.utils.book_new();
            const fdXslxws = XLSX.utils.json_to_sheet(this.list);
            XLSX.utils.book_append_sheet(wb, fdXslxws, "sheet1");
            XLSX.writeFile(wb, "xhs.xlsx");
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    }
}

new Xhs();