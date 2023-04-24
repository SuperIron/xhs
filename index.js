

// 爬取的数据量
const MAX_COUNT = 10;
// 操作延迟，单位秒
const HANDLE_DELAY = 2;
// 休息延迟，单位秒
const REST_DELAY = 180;
// 爬取的点赞数
const MIN_LIKES = 100;

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * 通过二进制流下载文件
 *
 * @param blob      二进制流
 * @param fileName  文件名称
 */
const useBlob = (blob, fileName) => {
    const link = document.createElement("a");
    const href = URL.createObjectURL(blob);
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // 释放掉blob对象
};
/**
 * 通过url下载文件，需要后端支持跨域
 *
 * @param url       文件地址
 * @param fileName  文件名称
 */
const useURL = (url, fileName) => {
    fetch(url).then((res) => __awaiter(void 0, void 0, void 0, function* () { return useBlob(yield res.blob(), fileName); }));
};
const download = {
    useBlob,
    useURL,
};




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
            this.exportXlsx();
            return;
        }
        try {
            await this.getList();
            await this.sleep(HANDLE_DELAY);
            this.reload();
            this.loop();
        } catch (err) {
            console.error(err)
            this.exportXlsx();
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

            const likeCount = like.indexOf('w') > -1 ? like.replace('w', '') * 10000 : Number(like)

            if (likeCount > MIN_LIKES) {
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
                    title,
                    like,
                    collect,
                    content,
                    date,
                    link,
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
    exportXlsx() {
        const xlsx =
            "https://cdn.bootcdn.net/ajax/libs/xlsx/0.16.9/xlsx.full.min.js";
        const script = document.createElement("script");
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", xlsx);
        script.onload = () => {
            const wb = XLSX.utils.book_new();
            const sheet = XLSX.utils.json_to_sheet(this.list);
            sheet["!cols"] = [
                { wch: 40 },
                { wch: 10 },
                { wch: 10 },
                { wch: 80 },
                { wch: 20 },
                { wch: 80 },
            ];
            XLSX.utils.book_append_sheet(wb, sheet, "sheet1");
            XLSX.writeFile(wb, "xhs.xlsx");
        };
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    exportJson() {
        const json = JSON.stringify(this.list);
        const blob = new Blob([json], { type: "text/json" })
        download.useBlob(blob, 'notes.json')
    }

    // 日志
    log(msg) {
        console.log(`Xhs...`, msg)
    }
}


new Xhs();