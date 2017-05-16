function SelectBox($cell) {
    var $list = $cell.find("ul.venus-menu");
    $list.hide();
    var $items = $list.children("li");
    var $input = $cell.find("input.selectText");
    var isSelectAll = false;
    /*下拉列表*/
    $input.on("focus", function() {
        $list.show();
    });

    $list.on("click", function(e) {
        e.stopPropagation();
        var tagName = e.target.tagName.toLowerCase();
        if (tagName == "ul") return;
        var l = $items.length;
        var p = $(e.target);
        var flag = true;
        switch (tagName) {
            case "li":
                p = p.children("input");
                break;
            case "input":
                flag = !flag;
                break;
            default:
                p = p.siblings("input");
                break;
        }
        if (p.hasClass("selectAll")) {
            if (!isSelectAll) {
                var val = p.next("label").text();
                console.log(true);
                $items.find("input").prop("checked", true);
                $input.val(val);
                $list.hide();
            } else {
                $items.find("input").prop("checked", false);
                console.log(false);
            }
            isSelectAll = !isSelectAll;
        } else {
            var str = "";
            if (p.length) {
                flag && p.prop("checked", !p.prop("checked"));
                if (!p.prop("checked")) {
                    $items.children("input.selectAll").prop("checked", false);
                    isSelectAll = false;
                }
                for (var i = 0; i < l; i++) {
                    if ($items.eq(i).children("input").prop("checked")) {
                        str += $items.eq(i).children("label").text() + ",";
                    }
                }
                str && (str = str.substring(0, str.length - 1));
            } else {
                str = $(e.target).text();
                $list.hide();
            }
            $input.val(str);
        }
    });
    return this;
}
/*更多筛选条件*/
function morePart() {
    var $btn = $(".moreItem");
    var $morePart = $(".more-part");
    $btn.click(function() {
        $btn.find("i").toggleClass('fa-caret-up');
        $morePart.toggle();
        var $display = $morePart.css("display");
        if ($display == "none") {
            $btn.find("span").text("更多筛选条件");
        } else {
            $btn.find("span").text("精简筛选条件");
        }
    });
}

/*左侧导航隐藏事件*/
function makeSmallNav() {
    $('#make-small-nav').click(function(e) {
        $('#page-wrapper').toggleClass('nav-small');
        $("#logo").css("width", "64px");
        if ($("#title").css("display") == "none") {
            $("#title").css("display", "inline-block");
            $("#logo").css("width", "220px");
        } else if ($("#title").css("display") == "inline-block") {
            $("#title").css("display", "none");
        } else if ($("#title").css("display") == "block") {
            $("#title").css("display", "none");
        }
    });
}
/*左侧菜单二级页面*/
function subMenu() {
    $('#leftMenu li').click(function(e) {
        $(this).find(".subMenu").slideToggle("fast");
    });
}

$(function($) {
	/*下拉选择*/
    $("div.selectContent").each(function(i, e) {
        var $e = $(e);
        new SelectBox($e);
    });
    morePart();
    makeSmallNav();
    subMenu();
   
    $('.modal').modal({
        backdrop: 'static',
        keyboard: false,
        show: false
    });

    /*点击空白区域下拉框消失*/
    $(document).bind(
        "click",
        function(e) {
            if ($(e.target).closest("input.selectText").length == 0 && $(e.target).closest("ul.venus-menu").length == 0) {
                if ($('#areaCode_shprCpca').val() == "") {
                    $('input.selectText').val("");
                }
                $("ul.venus-menu").css("display", "none");
            }
      });

    var docHeight = $(window).height()-40;
    var mainHeight = $(window).height()-60;
    $("main#page-wrapper").height(mainHeight);
    $("div#nav-col").height(docHeight);
    $(window).resize(function(){
          /*计算页面左侧高度，以及右侧宽度*/
        var docHeight = $(window).height()-40;
        var mainHeight = $(window).height()-60;

        $("main#page-wrapper").height(mainHeight);
        $("div#nav-col").height(docHeight);
    });


})
