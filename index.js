// 爬取的数据量
const MAX_COUNT = 100;
// 操作延迟，单位秒
const HANDLE_DELAY = 2;
// 休息延迟，单位秒
const REST_DELAY = 180;
// 爬取的点赞数
const MIN_LIKES = 100;


class Xhs {
    list = [];
    round = 1;

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
            await this.sleep(HANDLE_DELAY);
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
            let item = elements[i];
            // 链接
            let link = item.querySelector("a").href;
            // 点赞数
            let like = item.querySelector(".like-wrapper .count").innerText;
            // 标题
            let title = item.querySelector(".footer span").innerText;
            // 正文
            let content = "";
            // 日期
            let date = ''
            // 收藏数
            let collect = ''

            if (Number(like) > MIN_LIKES) {
                // 进入详情页
                item.querySelectorAll("a")[1].click();
                await this.sleep(HANDLE_DELAY);

                document
                    .querySelectorAll(".desc")
                    .forEach((item) => (content += item.innerText));
                date = document.querySelector(".date").innerText;
                collect = document.querySelector(
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
                this.log(this.list);

                if (!(this.list.length % 45)) {
                    this.log(`Resting ${REST_DELAY}s`)
                    await this.sleep(REST_DELAY)
                }
            }
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

    // 日志
    log(msg) {
        console.log(`Xhs...`, msg)
    }
}

new Xhs();