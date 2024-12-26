$(document).ready(function() {
    attachQuantityCheckEvent($('.row .qquan'));
    toggleButton.addEventListener('click', () => {
        if (myForm.style.display === 'none' || myForm.style.display === '') {
            myForm.style.display = 'block'; // Show the form
            toggleButton.textContent = 'Hide Filter'; // Change button text
        } else {
            myForm.style.display = 'none'; // Hide the form
            toggleButton.textContent = 'Fillter Date'; // Change button text
        }
    });
    itemContainer.addEventListener('change', function(event) {
            if (event.target.classList.contains('sit')) {
                price();
                attachQuantityCheckEvent($('.row .quantity'));
            }
        });
    
    // Event listener for input change
    
    
    
    // Event listeners for input changes
    
   
    

});
function attachPriceChangeEvent(selectElement) {
    selectElement.off('change').on('change', async function() {
        const selectedItem = this.value;
        const $row = $(this).closest('.row');
        const priceBox = $row.find('.pprice');
        const unitBox = $row.find('input[name="sunit"]');
        const pup = $row.find('input[name="pup"]');
        const cur = $row.find('input[name="curr"]');
        const sc = $('#sc').val();
        const cr = $('#cr').val();
        if (selectedItem) {
            try {
                const response = await fetch(`http://localhost:3000/price/${selectedItem}`);
                if (response.ok) {
                    const data = await response.json();
                    cur.val(data.currency);
                    if (sc==='USD') {
                        if (cur.val()==="AFN") {
                            priceBox.val((data.price/cr).toFixed(2));
                            pup.val((data.profit/cr).toFixed(2));
                        } else if (cur.val()==="USD") {
                            priceBox.val(data.price);
                            pup.val(data.profit.toFixed(2));
                        } 
                    } else if(sc==='AFN') {
                        if (cur.val()==="USD") {
                            priceBox.val((data.price*cr).toFixed(2));
                            pup.val((data.profit*cr).toFixed(2));
                        } else if (cur.val()==="AFN") {
                            priceBox.val(data.price.toFixed(2));
                            pup.val(data.profit.toFixed(2));
                            
                        }
                    }
                    
                } else {
                    priceBox.value = '0';
                }
            } catch (error) {
                console.error('Error fetching price:', error);
                priceBox.val('0');
                pup.val('0');
            }
            
            // Fetch unit
            try {
                const response = await fetch(`http://localhost:3000/unit/${selectedItem}`);
                if (response.ok) {
                    const data = await response.json();
                    unitBox.val(data.unit);
                } else {
                    unitBox.val('0');
                }
            } catch (error) {
                console.error('Error fetching unit:', error);
                unitBox.val('0');
            }
           
        } else {
            priceBox.val('');
            unitBox.val('');
        }
        updateTotal($row);
    });
}
function price(){
    
    const itemSelect = document.getElementById('sit');
    const pp = document.getElementById('sit');
    const cc = document.getElementById('sit');
    const pup = document.getElementById('pup');
    const priceBox = document.getElementById('pprice');
    const itsl = document.getElementById('sit');
    const priceBo = document.getElementById('sunit');
    const cur = document.getElementById('curr');
    const cr = document.getElementById('cr');
    const sc = document.getElementById('sc');
    itemSelect.onchange = async () => {
        const selectedItem = itemSelect.value;
        if (selectedItem) {
            const response = await fetch(`http://localhost:3000/price/${selectedItem}`);
            
            if (response.ok) {
                const data = await response.json();
                cur.value=data.currency;
                if (sc.value==='USD') {
                    
                    if (cur.value==="AFN") {
                        priceBox.value=(data.price/cr.value).toFixed(2)
                        pup.value=(data.profit/cr.value).toFixed(2)
                    } else if (cur.value==="USD") {
                        priceBox.value = data.price;
                        pup.value=data.profit.toFixed(2);
                    } 
                } else if(sc.value==='AFN') {
                    if (cur.value==="USD") {
                        priceBox.value=(data.price*cr.value).toFixed(2);
                        pup.value=(data.profit*cr.value).toFixed(2);
                    } else if (cur.value==="AFN") {
                        priceBox.value = data.price.toFixed(2);
                        pup.value=data.profit.toFixed(2);
                        
                    }
                }
                
            } else {
                priceBox.value = '0';
                pup.value = '0';
            }
        } else {
            priceBox.value = '';
        }
        const electedItem = itsl.value;
        if (electedItem) {
            const response = await fetch(`http://localhost:3000/unit/${electedItem}`);
            if (response.ok) {
                const data = await response.json();
                priceBo.value = data.unit;
            } else {
                priceBo.value = '0';
            }
        } else {
            priceBo.value = '';
        }
       
    };
    
}
function attachQuantityCheckEvent(quantityInput) {
    quantityInput.off('input').on('input', async function() {
        const $row = $(this).closest('.row');
        const itemSelect = $row.find('select[name="sit"]');
        const selectedItem = itemSelect.val();
        const desiredQuantity = parseInt(this.value, 10);

        if (selectedItem && !isNaN(desiredQuantity)) {
            try {
                const response = await fetch(`http://localhost:3000/stock/${selectedItem}`);
                if (response.ok) {
                    const data = await response.json();
                    const availableQuantity = data.quantity;

                    if (desiredQuantity > availableQuantity) {
                        alert(`Insufficient stock! Available quantity: ${availableQuantity}`);
                        this.value = ''; // Clear quantity input if stock is insufficient
                    }
                } else {
                    alert('Item not found');
                }
            } catch (error) {
                console.error('Error fetching stock:', error);
            }
        } else {
            alert('Please select an item and enter a valid quantity.');
        }
    });

    // Clear quantity input when the item changes
    $row.find('select[name="sit"]').off('change').on('change', function() {
        quantityInput.val(''); // Clear quantity input when item changes
    });
}

function quantitiycheck(){
    const itemSelect = document.getElementById('sit');
        const quantityInput = document.getElementById('qquan');

        quantityInput.addEventListener('input', async () => {
            const selectedItem = itemSelect.value;
            const desiredQuantity = parseInt(quantityInput.value, 10);

            if (selectedItem && !isNaN(desiredQuantity)) {
                try {
                    const response = await fetch(`http://localhost:3000/stock/${selectedItem}`);
                    if (response.ok) {
                        const data = await response.json();
                        const availableQuantity = data.quantity;

                        if (desiredQuantity > availableQuantity) {
                            alert(`Insufficient stock! Available quantity: ${availableQuantity}`);
                            quantityInput.value = ''; // Clear quantity input if stock is insufficient
                        }
                    } else {
                        alert('Item not found');
                    }
                } catch (error) {
                    console.error('Error fetching stock:', error);
                }
            } else {
                
            }
        });

        // Optional: Add a listener to the select element to prevent checking when no item is selected
        itemSelect.addEventListener('change', () => {
            quantityInput.value = ''; // Clear quantity input when item changes
        });
        
}



function filterdate(){
    $('.fil').on('click', function() {
        const startDate = new Date($('#startDate').val());
        const endDate = new Date($('#endDate').val());
        $('#myTable tbody tr:visible').each(function() {
            const dateText = $(this).find('td:nth-child(1)').text(); // Get the date text
            const rowDate = new Date(dateText); // Convert to Date object

            // Check if the date is within the specified range
            if (rowDate >= startDate && rowDate <= endDate) {
                $(this).show(); // Show the row
                sumpayment()
                
            } else {
                $(this).hide(); // Hide the row
                sumpayment()
                
            }
        });
        
    });
    
}
function filterdatex(){
    
        const startDate = new Date($('#startDate').val());
        const endDate = new Date($('#endDate').val());
        $('#expense-table tbody tr:visible').each(function() {
            const dateText = $(this).find('td:nth-child(1)').text(); // Get the date text
            const rowDate = new Date(dateText); // Convert to Date object

            // Check if the date is within the specified range
            if (rowDate >= startDate && rowDate <= endDate) {
                $(this).show(); // Show the row
                updateTotal()
                
            } else {
                $(this).hide(); // Hide the row
                updateTotal()
                
            }
        });
        

    
}


function myFunction() {
    // Declare variables
    var input, filter, table, tr, td,dt, i, txtValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[2];
        dt = tr[i].getElementsByTagName("td")[4];
        bt = tr[i].getElementsByTagName("td")[3];
        if (td||dt||bt) {
            txtValue = td.textContent || td.innerText 
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else if (td||dt||bt) {
            txtValue = dt.textContent || td.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else if (bt) {
            txtValue =bt.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
                
            }
        }
    }
    
}
    
}}
function myFunctiondr() {
    // Declare variables
    var input, filter, table, tr, td,dt, i, txtValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[2];
        dt = tr[i].getElementsByTagName("td")[4];
        bt = tr[i].getElementsByTagName("td")[1];
        if (td||dt||bt) {
            txtValue = td.textContent || td.innerText 
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else if (td||dt||bt) {
            txtValue = dt.textContent || td.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else if (bt) {
            txtValue =bt.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
                
            }
        }
    }
    
}
    
}}
function myFunctionsl() {
    // Declare variables
    var input, filter, table, tr, td,dt, i, txtValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.querySelectorAll('tbody tr');
    //tb = table.getElementsByTagName("tbody");
    
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        dt = tr[i].getElementsByTagName("td")[2];
        bt = tr[i].getElementsByTagName("td")[3];
        if (td||dt) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else if (td||dt) {
            txtValue = dt.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else if(bt) {
                txtValue = bt.textContent;
                tr[i].style.display = "none";
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
            }    
            }
        }
    }
    
}
sumpayment()
}

function myFunctionsSR() {
    // Declare variables
    var input, filter, table, tr, td,dt,bt, i, txtValue;
    input = document.getElementById("srsearch");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.querySelectorAll('tbody tr');
    //tb = table.getElementsByTagName("tbody");
    
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        dt = tr[i].getElementsByTagName("td")[2];
        bt = tr[i].getElementsByTagName("td")[5];
        if (td||dt) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else if (td||dt) {
            txtValue = dt.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else if(bt) {
                txtValue = bt.textContent;
                tr[i].style.display = "none";
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
            }    
            }
        }
    }
    
}
sumpayment();
}




function myFunctionspR() {
    // Declare variables
    var input, filter, table, tr, td,dt,bt, i, txtValue;
    input = document.getElementById("srsearch");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.querySelectorAll('tbody tr');
    //tb = table.getElementsByTagName("tbody");
    
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        dt = tr[i].getElementsByTagName("td")[2];
        
        if (td||dt||bt||cd) {
            txtValue = td.textContent || td.innerText 
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else if (td||dt) {
            txtValue = dt.textContent || td.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            
            } else {
                tr[i].style.display = "none";
                
            }
        }
    }
    

}
sumpayment();
}
function myFunctionspRu() {
    // Declare variables
    var input, filter, table, tr, td,dt,bt, i, txtValue;
    input = document.getElementById("srsearchu");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTableus");
    tr = table.querySelectorAll('tbody tr');
    //tb = table.getElementsByTagName("tbody");
    
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        dt = tr[i].getElementsByTagName("td")[2];
        
        if (td||dt||bt||cd) {
            txtValue = td.textContent || td.innerText 
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else if (td||dt) {
            txtValue = dt.textContent || td.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            
            } else {
                tr[i].style.display = "none";
                
            }
        }
    }
    

}
sumpayment();
}
function find() {
    // Declare variables
    var input, filter, table, tr, td,dt,bt, i, txtValue;
    input = document.getElementById("find");
    filter = input.value;
    table = document.getElementById("myTable");
    tr = table.querySelectorAll('tbody tr');
    //tb = table.getElementsByTagName("tbody");
    
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (parseInt(td)=filter) {
            txtValue = td.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else {
                tr[i].style.display = "none";
                
            }
        }
    }
    

}
function myFunctionex() {
    // Declare variables
    var input, filter, table, tr, td,dt, i, txtValue;
    input = document.getElementById("searchex");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        dt = tr[i].getElementsByTagName("td")[2];
        bt = tr[i].getElementsByTagName("td")[3];
        if (td||dt||bt) {
            txtValue = td.textContent || td.innerText 
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else if (td||dt||bt) {
            txtValue = dt.textContent || td.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            }else if (bt) {
            txtValue =bt.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
                
            }
        }
    }
    
}
}
sumex();
}
function show(event) {
    event.preventDefault()
    var urlre = event.currentTarget.getAttribute('href');
    Swal.fire({

        title: "Are you sure?",
        text: "You are deleting this Purchase!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {

            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Your work has been saved",
                showConfirmButton: false,
                timer: 1500
            }).then((result) => {
                window.location.href = urlre;
            })

        }
    });
        
}

function add(){
    var biln=$('#bil').val();
    var cn=$('#cname').val();
    var pn=$('#pname').val();
    var pp=$('#pprice').val();
    var pq=$('#pquantity').val();
    var tt=$('#total').val();
    document.getElementById('bilno').textContent ="QKTBN 00" + biln;
    if ($('#pprice').val==''|| $('#pprice').val()==0||$('#pquantity').val==''|| $('#pquantity').val()==0 ) {
        alert("Fill them correctly")
    } else {
        $('#dt').append('<tr> <td name="cn" id="cn" class="cn border-bottom-0" >         <h6  class="ccn fw-semibold mb-1">'+cn+'</h6>                </td>     <td  id="pn" class="pn border-bottom-0">       <h6  class="fw-semibold mb-1">'+pn+'</h6>     </td>     <td id="pp" class=" pp border-bottom-0">       <div class="d-flex align-items-center gap-2">         <p class="mb-0 fw-normal">'+pp+'</p>       </div>     </td>     <td id="pq" class="pq qtotal border-bottom-0">       <p class="mb-0 fw-normal">'+pq+'</p>     </td>     <td id="tot" class="tt ttotal border-bottom-0">         <span class="badge bg-primary  rounded-3 fw-semibold">'+tt+'</span>       <td class="border-bottom-0">  <a onClick="removeRow(this)" class=" btn btn-sm"   style="background-color: rgb(247, 17, 67); color: rgb(241, 241, 241);">    <i class="bi bi-trash3 ict"></i></a>      </td>      </tr>  ')
    $('#pname').focus();
    $('#pprice').val('0');
    $('#pquantity').val('0');
}   $('#total').val('');
    }
function dell(){
    document.querySelectorAll('.del').forEach(button => {
        
           const row = this.closest('tr');
           alert(row[3])

            // Remove the row from the table
           // row.remove();*/
            
        });
    
}
function senddata(){
    const pay = [];
                const billno=$('#bilno').text();
                const customern= $('#cname').val();
                const paid=$('#paid').val();
                const Total=$('#gt').text();
                const discount=$('#dis').val();
                const remain=parseFloat(Total)-paid-discount
                pay.push({billno,customern,paid,Total,remain,discount});
                

}
function sendData() {
    
    const items = [];
    const bill=$('#bil').val()
                $('tbody tr').each(function() {
                    const customer = $(this).find('.cn').text();
                    const currency = $(this).find('.sc').text();
                    const item = $(this).find('.pn').text();
                    const quantity = $(this).find('.pq').text();
                    const unit = $(this).find('.sunit').text();
                    const price = $(this).find('.pp').text();
                    const totalAmount = $(this).find('.tt').text();
                    
                     items.push({bill,customer,currency,price,unit,quantity,item,totalAmount});
                });
                const pay = {
                 billno:$('#bilno').text(),
                  paid:$('#paid').val(),
                  Total:$('#gt').text(),
                 customern: $('#cname').val(),
                 remain:parseFloat(Total)-paid-discount,
                 discount:$('#dis').val(),
                 currency:$('#sc').val(),
                }

                //pay.push({billno,customern,paid,Total,remain});
                const dataful={payme:pay,itms:items}

    $.ajax({
        url: '/neworder',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ dataful }),
        success: function(response) {
            alert(response.message); // Show success message
        },
        error: function(xhr, status, error) {
            console.error('Error:', error);
        }
    });
}
function addall(){
    add();
    
    const prices = document.querySelectorAll('.qtotal'); // Select all <td> elements with the class "price"
            let total = 0;

            prices.forEach(function(priceCell) {
                // Extract the numeric value from the cell's text content
                const priceValue = parseInt(priceCell.textContent);
                total += priceValue; // Add to the total
            });

            // Display the total sum
            document.getElementById('qt').textContent =  total;

            const gprices = document.querySelectorAll('.ttotal'); // Select all <td> elements with the class "price"
            let gtotal = 0;

            gprices.forEach(function(gpriceCell) {
                // Extract the numeric value from the cell's text content
                const gprice = parseFloat(gpriceCell.textContent);
                gtotal += gprice; // Add to the total
            });

            // Display the total sum
            document.getElementById('gt').textContent =  gtotal.toFixed(2);
            document.getElementById('paid').value =  gtotal.toFixed(2);
    
}
function removeRow(button) {
    // Get the row containing the button
    const row = button.parentNode.parentNode;
    // Remove the row from the table
    row.parentNode.removeChild(row);
    const prices = document.querySelectorAll('.qtotal'); // Select all <td> elements with the class "price"
            let total = 0;

            prices.forEach(function(priceCell) {
                // Extract the numeric value from the cell's text content
                const priceValue = parseInt(priceCell.textContent);
                total += priceValue; // Add to the total
            });

            // Display the total sum
            document.getElementById('qt').textContent =  total;

            const gprices = document.querySelectorAll('.ttotal'); // Select all <td> elements with the class "price"
            let gtotal = 0;

            gprices.forEach(function(gpriceCell) {
                // Extract the numeric value from the cell's text content
                const gprice = parseFloat(gpriceCell.textContent);
                gtotal += gprice; // Add to the total
            });

            // Display the total sum
            document.getElementById('gt').textContent =  gtotal.toFixed(2);
            document.getElementById('paid').value =  gtotal.toFixed(2);
}