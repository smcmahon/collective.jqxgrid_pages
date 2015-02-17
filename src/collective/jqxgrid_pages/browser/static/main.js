jQuery(function ($) {

/*
    if ($("body .template-edit .portaltype-jqxgrid_page")) {
        $("#formfield-form-widgets-data_definition")
            .hide()
            .after('<div id="jqxgrid-data" />');
        $("#formfield-form-widgets-column_definition")
            .hide()
            .after('<div id="jqxgrid-columns" />');
var data = [];
var source =
{
        localdata: data,
    datatype: "array"
};
var dataAdapter = new $.jqx.dataAdapter(source, {
        loadComplete: function (data) { },
        loadError: function (xhr, status, error) { }
});


        $("#jqxgrid-data").jqxGrid({
            source: dataAdapter,
            editable: true,
                columns: [
                    { text: 'First Name', datafield: 'firstname', width: 100 },
                    { text: 'Last Name', datafield: 'lastname', width: 100 },
                    { text: 'Product', datafield: 'productname', width: 180 },
                    { text: 'Quantity', datafield: 'quantity', width: 80, cellsalign: 'right' },
                    { text: 'Unit Price', datafield: 'price', width: 90, cellsalign: 'right', cellsformat: 'c2' },
                    { text: 'Total', datafield: 'total', width: 100, cellsalign: 'right', cellsformat: 'c2' }
            ]
            });

    }
*/

var local_data;
var jqxhr = $.getJSON( "http://jsonplaceholder.typicode.com/posts?callback=?", function(data) {
  console.log( "success" );
  console.log(data);
  local_data = data;
    if ($("#jqxgrid")) {
        var data_source = $('#data_source').html(),
            data_type = $('#data_type').html(),
            data_definition = $('#data_definition').html(),
            column_definition = $('#column_definition').html(),
            display_options = $('#display_options').html(),
            data_adapter;

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

        console.log(data_source);
        console.log(data_type);
        console.log(data_definition);
        console.log(column_definition);
        console.log(display_options);

        data_adapter = new $.jqx.dataAdapter({
            // datatype: data_type.toLowerCase(),
            datatype: 'array',
            datafields: data_definition,
            // url: data_source
            localdata: local_data
            });
        // console.log(data_adapter);

        $("#jqxgrid").jqxGrid({
            width: 850,
            source: data_adapter,
            sortable: display_options.search('Sortable') >= 0,
            filterable: display_options.search('Filter') >= 0,
            pageable: display_options.search('Paged') >= 0,
            autoheight: true,
            columnsresize: true,
            columns: column_definition
            });
    }

})
  .fail(function() {
    console.log( "error" );
  });

jqxhr.complete(function (data) {
    console.log('complete')
    console.log(data)
});

console.log('get done');
console.log(local_data);

// Perform other work here ...

});

