/**
 * <p>Title: 南京大学-研究生选课</p>
 * <p>Description: 输入课程页面的document对象，从页面中提取课程信息的HTML片段，输出HTML字符串</p>
 *
 * @author  HaoNShi
 * @date    2020-09-14
 * @version 1.1
 */
function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    return dom.querySelector('#wdkbTable').outerHTML
}