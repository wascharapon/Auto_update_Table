$(function() {
    show_lists();
    Run_Script_form();
});

function show_lists() {
    $.ajax({
        type: "get",
        url: "location_list",
        success: function(data) {
            $("#table_list_data").html(data);
            $(":input").inputmask();
            $(".th_hiden").html("-");
            var table = $("#location-list").DataTable({
                mark: true,
                responsive: true,
                lengthMenu: [
                    [20, 50, 100, 500, -1],
                    [20, 50, 100, 500, "ทั้งหมด"],
                ],
                language: {
                    url: "public/template/plugins/datatables_thai.json",
                },
                initComplete: function() {
                    this.api()
                        .columns()
                        .every(function() {
                            var that = this;
                            $("input", this.footer()).on("keyup change clear", function() {
                                if (that.search() !== this.value) {
                                    that.search(this.value).draw();
                                }
                            });
                        });
                },
            });
            $("#btn-hide-all-children").on("click", function() {
                table.rows(".parent").nodes().to$().find("td:first-child").trigger("click");
            });
            SwalAlert("success", "เรียกข้อมูลสำเร็จ");
            $("input[data-bootstrap-switch]").each(function() {
                $(this).bootstrapSwitch("state", $(this).prop("checked"));
            });
        },
    });
}

function Run_Script_form() {
    $('input[type="checkbox"].flat-red').iCheck({
        checkboxClass: "icheckbox_minimal-blue",
        radioClass: "iradio_flat-green",
    });
    $("#form_Location").validator();
    $(".select2").select2();
    $("[data-mask]").inputmask();
}

function chk_map() {
    var lt_lat = $("#lt_lat").val();
    var lt_lng = $("#lt_lng").val();
    window.open("https://www.google.com/maps?q=loc:" + lt_lat + "," + lt_lng + "", "_blank");
}

function chk_map_list(lt_lat, lt_lng) {
    window.open("https://www.google.com/maps?q=loc:" + lt_lat + "," + lt_lng + "", "_blank");
}


function add_data_form() {
    $.ajax({
        type: "get",
        url: "location_form",
        data: "",
        success: function(data) {
            $("#Index_Location").hide();
            $("#Location_form").html(data);
            $("#Location_form").validator();
            Run_Script_form();
        },
    }).done(function() {
        $("#loadding").modal("hide");
    });
}

function closeBB() {
    $("#Index_Location").show();
    $("#Location_form").html("");
}

function addRow() {
    $(".select2-container").remove();
    $(".clone-row").clone().insertAfter(".loop-row:last");
    var countRow = parseInt($(".loop-row").length);
    $(".loop-row").each(function(index, el) {
        if (countRow - 1 == index) {
            $(this).find("input").val("");
            $(this).find(".del-row").html("");
            $(this).find(".del-row").html('<input type="checkbox" name="del_bb" class="flat-red">');
            $(this).find(".has-feedback").removeClass("has-success has-error has-danger");
            $(this).find(".has-feedback").find(".glyphicon").removeClass("glyphicon-ok glyphicon-remove");
            $(this).find(".help-block").find(".list-unstyled").remove();
            $(".select2").removeAttr("aria-hidden");
            $(".select2").removeAttr("data-select2-id");
            $(".select2").removeAttr("tabindex");
            $(".select2").select2();
            Run_Script_form();
        } else {
            $(this).removeClass("clone-row");
        }
    });
    $("#Location_form").validator("update");
}

function deleteRow() {
    var countRow = parseInt($(".loop-row").length);
    $(".loop-row").each(function(index, el) {
        if ($(this).find(".del-row").find('input[type="checkbox"]').is(":checked")) {
            if (countRow - 1 != index) {
                $(this).remove();
            } else {
                alert("ไม่สามารถลบเเถวหลักได้");
                $(this).find(".del-row").html("");
                $(this).find(".del-row").html('<input type="checkbox" name="del_bb" class="flat-red">');
                Run_Script_form();
            }
        }
    });
}

function Get_EMPThaiProvince(that, type) {
    var id = $(that).val();
    var onchange = "";
    var name_input = "";
    if (type == "amphur") {
        onchange = "Get_EMPThaiProvince(this,'district')";
        name_input = "emp_dis[]";
    } else if (type == "district") {
        var postcode = $(that).closest("#add_Location").find(".select2-amphur").find(":selected").attr("postcode");
        $(that).closest("#add_Location").find(".postcode").val(postcode);
        name_input = "emp_sub_dis[]";
    }
    $.trim(type);
    $.ajax({
        type: "get",
        url: type,
        data: {
            id: id,
        },
        success: function(data) {
            $(that)
                .closest("#add_Location")
                .find("." + type)
                .html("");
            //Create Select option
            var sel = $("<select>")
                .appendTo($(that).closest("#add_Location"))
                .addClass("form-control select2-" + type)
                .attr({
                    onchange: onchange,
                    name: name_input,
                });
            // สร้าง Option เปล่าเอาไว้เลือก
            if (type == "amphur") {
                sel.append($("<option>").text("เลือกอำเภอ").attr("value", 0));
            } else if (type == "district") {
                sel.append($("<option>").text("เลือกตำบล").attr("value", 0));
            }
            // สร้าง Option ตามข้อมูลที่ได้มา
            $(data).each(function(index, el) {
                if (type == "amphur") {
                    sel.append($("<option>").text($(this)[0].AMPHUR_NAME).attr("value", $(this)[0].AMPHUR_ID).attr("postcode", $(this)[0].POSTCODE));
                } else if (type == "district") {
                    sel.append($("<option>").text($(this)[0].DISTRICT_NAME).attr("value", $(this)[0].DISTRICT_ID));
                }
            });
            $(".select2-" + type).select2();
        },
    });
}

function Open_Edit(id) {
    $.ajax({
        url: "location_edit/" + id,
        type: "GET",
        success: function(data) {
            $("#Index_Location").hide();
            $("#Location_form").html(data);
            Run_Script_form();
            //$('#table_list_data').html(data);
            $(":input").inputmask();
            $(".th_hiden").html("-");
            var table = $(".location-edit").DataTable({
                mark: true,
                responsive: true,
                lengthMenu: [
                    [10, 25, 50, 100, 500, -1],
                    [10, 25, 50, 100, 500, "ทั้งหมด"],
                ],
                language: {
                    url: "public/template/plugins/datatables_thai.json",
                },
                initComplete: function() {
                    this.api()
                        .columns()
                        .every(function() {
                            var that = this;
                            $("input", this.footer()).on("keyup change clear", function() {
                                if (that.search() !== this.value) {
                                    that.search(this.value).draw();
                                }
                            });
                        });
                },
            });
            process_rount();
            // $('#loadding').modal('show');
            setTimeout(function() {
                $("#DataTables_Table_0_paginate").click(function() {
                    setTimeout(function() {
                        process_rount();
                    }, 1000);
                });
                auto_update();
            }, 7000);
            $("#btn-hide-all-children").on("click", function() {
                table.rows(".parent").nodes().to$().find("td:first-child").trigger("click");
            });
            SwalAlert("success", "เรียกข้อมูลสำเร็จ");
            $("input[data-bootstrap-switch]").each(function() {
                $(this).bootstrapSwitch("state", $(this).prop("checked"));
            });
        },
    });
}




function CRUD() {
    //$('#loadding').modal('show');
    var location = new FormData($("#form_Location")[0]);
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        cache: false,
        contentType: false,
        processData: false
    });
    $.ajax({
        type: "post",
        url: 'location_distance_store',
        data: location,
        success: function(data) {
            console.log(data)
        }
    }).done(function() {});
}

function auto_update() {
    setTimeout(function() {
        $("#DataTables_Table_0_next").last().trigger("click");
        var i = $("a[data-dt-idx]").last().attr("data-dt-idx");
        i--;
        var paginate_max = $("a[data-dt-idx='" + i + "']").last().html();
        var paginate_current = $(".paginate_button.page-item.active").last().find("a").text();
        if (paginate_current != paginate_max) {
            setTimeout(function() {
                console.log("หน้าปัจจุบัน:", paginate_current, "จบที่:", paginate_max);
                process_rount();
                auto_update();
            }, 3500 * paginate_current);
        } else {
            $("#update_data").text("ดาวโหลด");
            $("#update_data").attr("class", "btn-success btn-lg")
            $("#update_data").attr("onclick", "CRUD()")
                //$('#loadding').modal('hide');
            console.log("จบการทำงาน");
        }
    }, 3000);
}


function process_rount() {
    $(".location_in_table").each(function(index) {
        $(this).trigger("onmouseover");
    })
}

function calculate_rount(that, id) {
    var lat_start = $(that).attr("lat_start");
    var lng_start = $(that).attr("lng_start");
    var lat_end = $(that).attr("lat_end");
    var lng_end = $(that).attr("lng_end");
    var status_data = $(that).attr("status_data");
    var tr_distance = $("#distanceText_" + id);
    var tr_duration = $("#durationText_" + id);
    var input_distance = $("#distanceInput_" + id);
    var input_duration = $("#durationInput_" + id);
    var tr_status = $("#location_" + id);
    if (status_data == 0) {
        initialize(lat_start, lng_start, lat_end, lng_end, tr_distance, tr_duration, tr_status, input_distance, input_duration)
    } else {
        console.log("อัพเดตแล้ว:", id)
    }

}

var directionShow;
var directionsService;
var map;
var GGM;
var my_Latlng;
var initialTo;
var searchRoute;

function initialize(lat_start, lng_start, lat_end, lng_end, td_distance, td_duration, tr_status, input_distance, input_duration) {
    GGM = new Object(google.maps);
    directionShow = new GGM.DirectionsRenderer({
        draggable: true,
    });
    directionsService = new GGM.DirectionsService();
    var namePlace = $("#namePlace").val();
    var toPlace = $("#toPlace").val();

    my_Latlng = new GGM.LatLng(lat_start, lng_start);
    initialTo = new GGM.LatLng(lat_end, lng_end);
    var my_mapTypeId = GGM.MapTypeId.ROADMAP;
    var my_DivObj = $("#map_canvas")[0];
    var myOptions = {
        zoom: 0,
        center: my_Latlng,
        mapTypeId: my_mapTypeId,
    };
    map = new GGM.Map(my_DivObj, myOptions);
    directionShow.setMap(map);
    if (map) {
        searchRoute(my_Latlng, initialTo, td_distance, td_duration, tr_status, input_distance, input_duration);
    }
}

$(function() {
    searchRoute = function(FromPlace, ToPlace, td_distance, td_duration, tr_status, input_distance, input_duration) {
        if (!FromPlace && !ToPlace) {
            var FromPlace = $("#namePlace").val();
            var ToPlace = $("#toPlace").val();
        }
        var request = {
            origin: FromPlace,
            destination: ToPlace,
            travelMode: GGM.DirectionsTravelMode.DRIVING,
        };
        directionsService.route(request, function(results, status) {
            if (status == GGM.DirectionsStatus.OK) {
                directionShow.setDirections(results);
                var addressStart = results.routes[0].legs[0].start_address;
                var addressEnd = results.routes[0].legs[0].end_address;
                var distanceText = results.routes[0].legs[0].distance.text;
                var distanceVal = results.routes[0].legs[0].distance.value;
                var durationText = results.routes[0].legs[0].duration.text;
                var durationVal = results.routes[0].legs[0].duration.value;
                $("#namePlaceGet").val(addressStart);
                $("#toPlaceGet").val(addressEnd);
                $("#distance_text").val(distanceText);
                $("#distance_value").val(distanceVal);
                $("#duration_text").val(durationText);
                $("#duration_value").val(durationVal);
                td_distance.html(distanceText);
                td_duration.html(durationText);
                input_distance.val(distanceText);
                input_duration.val(durationText);
                tr_status.attr("status_data", 1);
            } else {
                console.log("การร้องขอไม่สำเร็จ");
            }
        });
    };
});


$(function() {
    setTimeout(function() {
        $("<script/>", {
            type: "text/javascript",
            src: "//maps.google.com/maps/api/js?v=3.2&key=AIzaSyD7MjVaFRZx1F-BimdU-z1PlnnS8kGVpVw&sensor=false&language=th&callback=initialize",
        }).appendTo("#map_canvas");
    }, 500);
});
