/**
 * <p>Title: 南京大学-网上办事服务大厅-我的课表</p>
 * <p>Description: 输入课程页面的document对象，从页面中提取课程信息的HTML片段，输出HTML字符串</p>
 *
 * @author  CodeLumos
 * @date    2020-11-25
 * @version 1.0
 */
function scheduleHtmlProvider(iframeContent = "", frameContent = "", dom = document) {
    return dom.querySelector('#jsTbl_01').outerHTML
}