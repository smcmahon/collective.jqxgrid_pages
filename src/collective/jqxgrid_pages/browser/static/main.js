jQuery(function ($) {

    var grid = $("#jqxgrid"),
        format_help =
            '    <div id="format_help_trigger" style="cursor:pointer"><a href="#">Format Help +/-</a></div>\n' +
            '    <div id="format_help" style="white-space:pre-wrap; display:none; font-weight:normal">' +
            '<strong>Number formats</strong>\n' +
            '    "d" - decimal numbers.\n' +
            '    "f" - floating-point numbers.\n' +
            '    "n" - integer numbers.\n' +
            '    "c" - currency numbers.\n' +
            '    "p" - percentage numbers.\n' +
            'For adding decimal places to the numbers, add a number after the formatting string.\n' +
            'For example: "c3" displays a number in this format $25.256\n' +
            '\n' +
            '<strong>Date formats</strong>\n' +
            '    short date pattern d: "M/d/yyyy",\n' +
            '    long date pattern D: "dddd, MMMM dd, yyyy",\n' +
            '    short time pattern t: "h:mm tt",\n' +
            '    long time pattern T: "h:mm:ss tt",\n' +
            '    long date, short time pattern f: "dddd, MMMM dd, yyyy h:mm tt",\n' +
            '    long date, long time pattern F: "dddd, MMMM dd, yyyy h:mm:ss tt",\n' +
            '    month/day pattern M: "MMMM dd",\n' +
            '    month/year pattern Y: "yyyy MMMM"\n' +
            '    </div>\n';

    // construct grid on "view" pages.

    if (grid.length) {
        var data_source = $('#data_source').text(),
            data_type = $('#data_type').text().toLowerCase(),
            data_record = $('#data_record').text(),
            data_root = $('#data_root').text(),
            data_definition = $('#data_definition').text(),
            column_definition = $('#column_definition').text(),
            display_options = $('#display_options').text(),
            initial_sort_field = $('#initial_sort_field').text(),
            sort_direction = $('#sort_direction').text(),
            group = $('#group').text() === 'True',
            initial_filter = $('#initial_filter').text(),
            filter_match = $('#filter_match').text(),
            data_spec,
            data_adapter,
            jqxgrid_options;

        // Our data definition and column defs are drawn from text
        // fields that should contain JSON in strings.
        // Convert to array of JS objects.
        try {
            data_definition = $.parseJSON(data_definition);
        } catch(err) {
            alert("Unable to parse Data Definition: " + err.message);
            return;
        }
        try {
            column_definition = $.parseJSON(column_definition);
        } catch(err) {
            alert("Unable to parse Column Definition: " + err.message);
            return;
        }

        // Baseline grid options used for all sources.
        jqxgrid_options = {
            width: "100%",
            sortable: display_options.search('Sortable') >= 0,
            filterable: display_options.search('Filter') >= 0,
            pageable: display_options.search('Paged') >= 0,
            autoheight: display_options.search('Height') >= 0,
            autorowheight: display_options.search('Height') >= 0,
            columnsresize: true,
            columns: column_definition
            };
        if (group) {
            jqxgrid_options['groupable'] = true;
            jqxgrid_options['groups'] = [initial_sort_field];
            jqxgrid_options['showgroupsheader'] = false;
        }
        if (initial_filter) {
            jqxgrid_options['filterable'] = true;
            jqxgrid_options['ready'] = function () {
                var filtergroup = new $.jqx.filter(),
                    filtercondition = 'EQUAL';
                    filter = filtergroup.createfilter(
                        'stringfilter',
                        filter_match,
                        'EQUAL'
                        );
                filtergroup.addfilter(0, filter);
                grid.jqxGrid(
                    'addfilter',
                    initial_filter,
                    filtergroup
                    );
                grid.jqxGrid('applyfilters');
            };
        }


        // The url mechanism for jsonp is not working
        // (or I don't know how to use it).
        // So, let's gather the remote data ourselves.
        // Since AJAX is async, we need to create the grid in the
        // success callback.
        if (data_type === 'jsonp') {

            $.getJSON(data_source)
                .done(function (data) {
                    data_spec = {
                        datafields: data_definition,
                        datatype: 'json',
                        localdata: data
                        };
                    if (initial_sort_field !== '') {
                        data_spec['sortcolumn'] = initial_sort_field;
                        data_spec['sortdirection'] = sort_direction;
                    }
                    data_adapter = new $.jqx.dataAdapter(data_spec);
                    jqxgrid_options['source'] = data_adapter;
                    grid.jqxGrid(jqxgrid_options);
                    })
                .fail(function( jqxhr, textStatus, error ) {
                    alert( "Request Failed: " + textStatus + ", " + error );
                    });
        } else {
            // Our data has a source that the jqx data adapter can
            // handle.
            data_spec = {
                datafields: data_definition,
                datatype: data_type,
                url: data_source
            };
            if (data_type === 'xml') {
                data_spec['root'] = data_root;
                data_spec['record'] = data_record;
            }
            data_adapter = new $.jqx.dataAdapter(data_spec);
            if (initial_sort_field !== '') {
                data_spec['sortcolumn'] = initial_sort_field;
                data_spec['sortdirection'] = sort_direction;
            }
            jqxgrid_options['source'] = data_adapter;
            grid.jqxGrid(jqxgrid_options);
        }

        // export button callback
        $("#export_form").submit(function (event) {
            var format = $("#export_format").val();

            event.preventDefault();
            $("#jqxgrid").jqxGrid('exportdata', format, "export");
        });

    }

    // Set up the edit form, using the nice jqwidgets
    // for data and column def and checkbox multiselect for options.
    if ($("#form-widgets-data_definition").length) {
        var addGridForField,
            form_widgets_data_type = $("#form-widgets-data_type");

        // toggle display of xml-specific fields
        // and change when data type changes
        form_widgets_data_type.change(function(event) {
            var controls = $("#formfield-form-widgets-data_root, #formfield-form-widgets-data_record");

            if($("#form-widgets-data_type").val() === 'XML') {
                controls.fadeIn();
            } else {
                controls.fadeOut();
            }
        });
        form_widgets_data_type.change();

        // function to build a grid field from a text field
        // and keep the text field updated.
        // We'll use this for both the data and column def fields.
        // null_row is used as data when we add a new row.
        addGridForField = function (
                target_selector,
                grid_id,
                datafields,
                columns,
                null_row) {
            var target,
                target_value,
                data,
                ddgrid,
                updateDataDefinition;

            // find our textarea field -- which contains JSON in a string.
            // add the jqxgrid after it and hide the original field.
            target = $(target_selector);
            target.after('<div id="' + grid_id + '"></div>');
            target_value = target.val();

            // get the json string and convert to array of js objects
            if (target_value.length === 0) {
                target_value = "[]";
            }
            try {
                data = $.parseJSON(target_value);
            } catch(err) {
                alert("Unable to parse JSON: " + err.message);
                return;
            }

            // Fixup:
            // jqxGrid fails if 'map' is used as the name of
            // a datafield. So, convert all 'map' properties
            // to 'mapping'. This gets reversed on export.
            $.each(data, function (index, value) {
                if (value.hasOwnProperty('map')) {
                    value['mapping'] = value['map'];
                    delete value['map'];
                }
            });

            // convenience function to
            // move data from grid back to the original textarea field
            updateDataDefinition = function () {
                var data = ddgrid.jqxGrid('getrows');

                // reverse the map/mapping adjustment
                $(target_selector)
                    .text(JSON.stringify(data).replace(/"mapping"/g, '"map"'));
            };

            // create the grid
            ddgrid = $("#" + grid_id);
            ddgrid.jqxGrid({
                width: "80%",
                autoheight: true,
                columnsresize: true,
                editable: true,
                showtoolbar: true,
                rendertoolbar: function (toolbar) {
                    // create a toolbar with add and delete row buttons
                    var container,
                        addrowbutton,
                        deleterowbutton;

                        container = $("<div style='margin: 5px;'></div>");
                        toolbar.append(container);
                        container.append('<input id="' + grid_id + '_addrowbutton" type="button" value="Add New Row" />');
                        container.append('<input style="margin-left: 5px;" id="' + grid_id + '_deleterowbutton" type="button" value="Delete Selected Row" />');

                        addrowbutton = $("#" + grid_id + "_addrowbutton");
                        addrowbutton.jqxButton();
                        addrowbutton.on('click', function () {
                            ddgrid.jqxGrid(
                                'addrow',
                                null,
                                null_row()
                            );
                        });

                        deleterowbutton = $("#" + grid_id + "_deleterowbutton");
                        deleterowbutton.jqxButton();
                        deleterowbutton.on('click', function () {
                            var selectedrowindex = ddgrid.jqxGrid('getselectedrowindex'),
                                rowscount = ddgrid.jqxGrid('getdatainformation').rowscount;

                            if (selectedrowindex >= 0 && selectedrowindex < rowscount) {
                                var id = ddgrid.jqxGrid('getrowid', selectedrowindex),
                                    commit = ddgrid.jqxGrid('deleterow', id);
                            }
                        });
                    },
                source: new $.jqx.dataAdapter({
                    datafields: datafields,
                    datatype: 'json',
                    localdata: data,
                    addrow: function (rowid, rowdata, position, commit) {
                        commit(true);
                        },
                    deleterow: function (rowid, commit) {
                        commit(true);
                        updateDataDefinition();
                        }
                    }),
                columns: columns
            });

            ddgrid.on('cellvaluechanged', function (event) {
                updateDataDefinition();
            });

            $(target_selector).hide();

        }; // addGridForField

        // create data definition grid.
        addGridForField(
            "#form-widgets-data_definition",
            "data_definition_grid",
            [
                {name: 'name', type: 'string'},
                {name: 'type', type: 'string'},
                {name: 'mapping', type: 'string'}
            ],
            [
                {text: 'Field Name', datafield: 'name', width: 250 },
                {
                    text: 'Data Type',
                    datafield: 'type',
                    width: 90,
                    columntype: 'dropdownlist',
                    createeditor: function (row, value, editor) {
                        editor.jqxDropDownList({source:
                            [
                                'string',
                                'date',
                                'number',
                                'int',
                                'float',
                                'bool'
                            ]});
                    }
                },
                {text: 'Mapping', datafield: 'mapping', width: 250}
            ],
            function () {
                return {
                    name: '',
                    type: 'string',
                    mapping: ''
                };
            }
        );

        // create grid for column definitions
        addGridForField(
            "#form-widgets-column_definition",
            "columns_grid",
            [
                {name: 'text', type: 'string'},
                {name: 'datafield', type: 'string'},
                {name: 'width', type: 'string'},
                {name: 'cellsalign', type: 'string'},
                {name: 'cellsformat', type: 'string'}
            ],
            [
                {text: 'Title', datafield: 'text', width: 250 },
                {text: 'Field Name', datafield: 'datafield', width: 250},
                {
                    text: 'Column Width',
                    datafield: 'width',
                    width: 100,
                    cellsalign: 'right'
                },
                {
                    text: 'Align',
                    datafield: 'cellsalign',
                    columntype: 'dropdownlist',
                    createeditor: function (row, value, editor) {
                        editor.jqxDropDownList({source:
                            [
                                'left',
                                'center',
                                'right'
                            ]});
                    },
                    width: 80
                },
                {
                    text: 'Format',
                    datafield: 'cellsformat',
                    width: 80,
                }
            ],
            function () {
                return {
                    text: '',
                    datafield: '',
                    cellsalign: 'left'
                };
            }
        );

        // jqwidget gives us a checkbox multiple select.
        // Let's use it to handle the display options.
        // options are loaded from the select field in the form.
        var display_options_select = $("#form-widgets-display_options"),
            display_options_jqxlist = $('<div id="display_options_jqxlist">Options</div>');

        display_options_select.hide().after(display_options_jqxlist);
        display_options_jqxlist.jqxListBox({height: 125, checkboxes: true});
        display_options_jqxlist.jqxListBox('loadFromSelect', "form-widgets-display_options");

        // when form is submitted, copy options back to the original
        // select field.
        $("#content-core form").submit(function (event) {
            var checked = {};

            $.each(display_options_jqxlist.jqxListBox('getCheckedItems'), function () {
                checked[this.value] = 1;
            });

            display_options_select.children("option").each(function () {
                var jqt = $(this);

                jqt.attr('selected', checked.hasOwnProperty(jqt.val()));
            });
        });

        // insert format help and display toggle
        $("#formfield-form-widgets-column_definition .formHelp")
            .after(format_help);
        $("#format_help_trigger").click(function (event) {
            $("#format_help").slideToggle();
            event.preventDefault()
        });

    } // if on edit view

});

