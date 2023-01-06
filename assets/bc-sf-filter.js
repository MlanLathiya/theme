// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: 12,
        /* Optional */
        // loadProductFirst: true,
    }
};

// Declare Templates
var bcSfFilterTemplate = {
    'soldOutClass': 'sold-out',
    'saleClass': 'on-sale',
    'soldOutLabelHtml': '<div>' + bcSfFilterConfig.label.sold_out + '</div>',
    'saleLabelHtml': '<div>' + bcSfFilterConfig.label.sale + '</div>',
    'vendorHtml': '<div>{{itemVendorLabel}}</div>',

    // Grid Template
    'productGridItemHtml': '<div class="product col-xl-4 col-lg-6 col-md-4 col-sm-6 mb-30">' +
        '<div class="prod_block {{soldOutClass}} {{saleClass}}">' +
        '<div class="image" data-featured-image="{{itemThumbUrl}}" style="background-image: url({{itemThumbUrl}})">' +
        '<a href="{{itemUrl}}"></a>' +
        '<div class="swatch-hover"></div>' +
        '</div>' +
        '<div class="info">' +
        '<h3><a href="{{itemUrl}}">{{itemTitle}}</a></h3>' +
        //'<div data-bv-show="inline_rating" data-bv-product-Id="{{itemId}}" data-bv-redirect-url="{{itemUrl}}"></div>' +
        '<div class="pwr-category-snippets"><div class="review-id" id="snippet-{{itemId}}" data-id="snippet-{{itemId}}"></div></div>' +
        '{{itemPrice}}' +
        '{{itemSwatches}}' +
        '</div>' +
        '</div>' +
        '</div>',

    // Pagination Template
    'previousActiveHtml': '<a href="{{itemUrl}}" class="prev btns bordered">Previous</a>',
    'previousDisabledHtml': '<a href="{{pageItemUrl}}" class="prev btns bordered">Previous</a>',
    'nextActiveHtml': '<a href="{{itemUrl}}" class="next btns">Next</a>',
    'nextDisabledHtml': '<a href="{{itemUrl}}" class="next btns">Next</a>',
    'pageItemHtml': '<a href="{{itemUrl}}">{{itemTitle}}</a>',
    'pageItemSelectedHtml': '<a id="current" class="active">{{itemTitle}}</a>',
    'pageItemRemainHtml': '<span>{{itemTitle}}</span>',
    'paginateHtml': '<div class="pagination_info">{{pageItems}}{{previous}}{{next}}</div>',

    // Sorting Template
    'sortingHtml': '<label class="label--hidden">' + bcSfFilterConfig.label.sorting + '</label><div class="select-wrap"><select class="collection-sort__input select">{{sortingItems}}</select></div>',
};

/************************** BUILD PRODUCT LIST **************************/

// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function (data, index) {
    /*** Prepare data ***/
    var images = data.images_info;
    // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function (e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    /*** End Prepare data ***/

    // Get Template
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;

    // Add Thumbnail
    var itemThumbUrl = images.length > 0 ? this.optimizeImage(images[0]['src']) : bcSfFilterConfig.general.no_image_url;
    if (firstVariant.image) itemThumbUrl = this.optimizeImage(firstVariant.image);
    itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);


    var itemPriceHtml = '';
    //     if (data.title != '')  {
    //         itemPriceHtml += '<p class="price">';   
    //         if (priceVaries && !onSale){
    //           itemPriceHtml += '<span class="from-text">From </span>';
    //         }

    //       	if (onSale){
    //           itemPriceHtml += '<span class="from-text">From </span>';
    //           itemPriceHtml += '<span class="the-price sale">';

    //         }else{
    //           itemPriceHtml += '<span class="the-price">';
    //         }
    //       	itemPriceHtml += '<span class="Bold-theme-hook-DO-NOT-DELETE bold_product_page_price" style="display:none !important;"></span>';
    //       	itemPriceHtml += '<span class="Bold-theme-hook-DO-NOT-DELETE bold_product_price" data-override-value-set="1" data-override-value="'+data.price_min+'" style="display:none !important;"></span>';

    //       	itemPriceHtml += this.formatMoney(data.price_min);

    //       	itemPriceHtml += '</span>';

    //         itemPriceHtml += '</p>';
    //     }
    if (data.title != '') {
        var minPriceAvailableVariant = data.price_min;
        var minCompareAtPriceAvailableVariant = data.compare_at_price_min;
        var sortVariantArr = data.variants.sort((a, b) => (a.price > b.price) ? 1 : -1);

        var firstVariantAvailable = sortVariantArr.find(function (e) {
            return e.available;
        });

        if (typeof firstVariantAvailable !== 'undefined') {
            minPriceAvailableVariant = firstVariantAvailable.price;
            minCompareAtPriceAvailableVariant = firstVariantAvailable.compare_at_price;
            if (minCompareAtPriceAvailableVariant !== null && minCompareAtPriceAvailableVariant > minPriceAvailableVariant) {
                onSale = true;
            } else if (minCompareAtPriceAvailableVariant == null) {
                onSale = false;
            }
        }

        itemPriceHtml += '<p class="price">';
        //         if (priceVaries && !onSale){
        //           itemPriceHtml += '<span class="from-text">From </span>';
        //         }

        if (onSale) {
            itemPriceHtml += '<span class="from-text">From </span>';
            itemPriceHtml += '<span class="the-price sale">';
        } else {
            itemPriceHtml += '<span class="the-price">';
        }
        itemPriceHtml += '<span class="Bold-theme-hook-DO-NOT-DELETE bold_product_page_price" style="display:none !important;"></span>';
        itemPriceHtml += '<span class="Bold-theme-hook-DO-NOT-DELETE bold_product_price" data-override-value-set="1" data-override-value="' + data.price_min + '" style="display:none !important;"></span>';

        itemPriceHtml += this.formatMoney(minPriceAvailableVariant);

        itemPriceHtml += '</span>';

        itemPriceHtml += '</p>';
    }
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

    //swatches

    var itemSwatchesHtml = '<div data-handle="' + data.handle + '" class="collection-swatches-holder collection-swatches-' + data.handle + '"></div>'
    itemHtml = itemHtml.replace(/{{itemSwatches}}/g, itemSwatchesHtml);


    // Add soldOut class
    var soldOutClass = soldOut ? bcSfFilterTemplate.soldOutClass : '';
    itemHtml = itemHtml.replace(/{{soldOutClass}}/g, soldOutClass);

    // Add onSale class
    var saleClass = onSale ? bcSfFilterTemplate.saleClass : '';
    itemHtml = itemHtml.replace(/{{saleClass}}/g, saleClass);

    // Add soldOut Label
    var itemSoldOutLabelHtml = soldOut ? bcSfFilterTemplate.soldOutLabelHtml : '';
    itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, itemSoldOutLabelHtml);

    // Add onSale Label
    var itemSaleLabelHtml = onSale ? bcSfFilterTemplate.saleLabelHtml : '';
    itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabelHtml);


    // Add Vendor
    var itemVendorHtml = bcSfFilterConfig.custom.vendor_enable ? bcSfFilterTemplate.vendorHtml.replace(/{{itemVendorLabel}}/g, data.vendor) : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add main attribute (Always put at the end of this function)
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    //itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, '/products/' + data.handle);


    // Add Tag Image
    var asset_url = bcSfFilterConfig.custom.asset_url;
    var tagImageHtml = '';
    if (data.tags.length) {
        for (var i in data.tags) {
            if (data.tags[i].toLowerCase() == 'josef seibel') {
                tagImageHtml = '<img src="' + asset_url + 'js-hover-logo.png" alt="" />';
            }

            if (data.tags[i].toLowerCase() == 'gerry webber') {
                tagImageHtml = '<img src="' + asset_url + 'gerry-webber-hover-logo.png" alt="" />';
            }

            if (data.tags[i].toLowerCase() == 'romika') {
                tagImageHtml = '<img src="' + asset_url + 'romika-hover-logo.png" alt="" />';
            }
        }
    }

    itemHtml = itemHtml.replace(/{{tagImage}}/g, tagImageHtml);


    return itemHtml;
};

// Build Product List Item
BCSfFilter.prototype.buildProductListItem = function (data) {
    // // Add Description
    // var itemDescription = jQ('<p>' + data.body_html + '</p>').text();
    // // Truncate by word
    // itemDescription = (itemDescription.split(" ")).length > 51 ? itemDescription.split(" ").splice(0, 51).join(" ") + '...' : itemDescription.split(" ").splice(0, 51).join(" ");
    // // Truncate by character
    // itemDescription = itemDescription.length > 350 ? itemDescription.substring(0, 350) + '...' : itemDescription.substring(0, 350);
    // itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescription);
};

// Customize data to suit the data of Shopify API

/************************** END BUILD PRODUCT LIST **************************/

// Build Pagination
BCSfFilter.prototype.buildPagination = function (totalProduct) {
    if (this.getSettingValue('general.paginationType') == 'default') {
        // Get page info
        var currentPage = parseInt(this.queryParams.page);
        var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

        // If it has only one page, clear Pagination
        if (totalPage == 1) {
            jQ(this.selector.bottomPagination).html('');
            return false;
        }


        if (this.getSettingValue('general.paginationType') == 'default') {
            var paginationHtml = bcSfFilterTemplate.paginateHtml;

            // Build Previous
            var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
            previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
            previousHtml = previousHtml.replace(/{{pageItemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage));
            paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

            // Build Next
            var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml : bcSfFilterTemplate.nextDisabledHtml;
            nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
            paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

            let pageInfo = currentPage + ' of ' + totalPage + ' pages';

            var pageItemRemainHtml = bcSfFilterTemplate.pageItemRemainHtml;
            pageItemRemainHtml = pageItemRemainHtml.replace(/{{itemTitle}}/g, pageInfo);

            paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemRemainHtml);

            jQ(this.selector.bottomPagination).html(paginationHtml);
        }
    }
};

/************************** BUILD TOOLBAR **************************/

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function () {
    if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
        jQ(this.selector.topSorting).html('');

        var sortingArr = this.getSortingList();
        if (sortingArr) {
            // Build content 
            var sortingItemsHtml = '';
            for (var k in sortingArr) {
                sortingItemsHtml += '<option value="' + k + '">' + sortingArr[k] + '</option>';
            }
            var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
            jQ(this.selector.topSorting).html(html);

            // Set current value
            jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
        }
    }
};

// Build Display type (List / Grid / Collage)
// BCSfFilter.prototype.buildFilterDisplayType = function() {
//     var itemHtml = '<a href="' + this.buildToolbarLink('display', 'list', 'grid') + '" title="Grid view" class="change-view bc-sf-filter-display-grid" data-view="grid"><span class="icon-fallback-text"><i class="fa fa-th" aria-hidden="true"></i><span class="fallback-text">Grid view</span></span></a>';
//     itemHtml += '<a href="' + this.buildToolbarLink('display', 'grid', 'list') + '" title="List view" class="change-view bc-sf-filter-display-list" data-view="list"><span class="icon-fallback-text"><i class="fa fa-list" aria-hidden="true"></i><span class="fallback-text">List view</span></span></a>';
//     jQ(this.selector.topDisplayType).html(itemHtml);

//     // Active current display type
//     jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').removeClass('active');
//     jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').removeClass('active');
//     if (this.queryParams.display == 'list') {
//         jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').addClass('active');
//     } else if (this.queryParams.display == 'grid') {
//         jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').addClass('active');
//     }
// };

/************************** END BUILD TOOLBAR **************************/

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function (data, eventType) {
    if (window.SPR) {
        SPR.initDomEls();
        SPR.loadBadges();
    }

    if (jQ('.collection-swatches-holder').length) {
        jQ('.collection-swatches-holder').each(function () {
            var _that = jQ(this);
            jQuery.ajax({
                type: 'GET',
                url: '/products/' + jQ(this).data('handle') + '?view=swatches',
                processData: false,
                contentType: false,
                success: function (data) {
                    var swatches = jQ('.collection-swatches-' + _that.data('handle'))
                    
                    swatches.append(data);
                    var large_image = swatches.parent().parent().find('.image').data('featured-image').replace('https:', '');
                    console.log("large_image: ", large_image)

                    swatches.find('.color-swatch').each(function () {
                        if (large_image == jQ(this).data('image')) {
                            jQ(this).addClass('active');
                        }
                    })

                    swatches.find('.color-swatch').click(function (e) {
                        e.preventDefault();
                        var large_image = jQ(this).data('image');
                        swatches.parent().parent().find('.image').find('.swatch-hover').attr('style', '').attr('style', 'background-image: url(' + large_image + ')');
                        jQ(this).parent().find('.active').removeClass('active');
                        jQ(this).addClass('active');

                    })
                }
            });
        })
    }

};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function (data, eventType) {
    var params = [];
    jQ('.pwr-category-snippets .review-id').each(function (i) {
        var obj = {}, product_id = {};
        product_id['CategorySnippet'] = jQ(this).data('id');
        obj['api_key'] = '354c0837-4e2b-4ee9-843d-b0114e6e4f44';
        obj['locale'] = 'en_GB';
        obj['merchant_group_id'] = '345204098';
        obj['merchant_id'] = '2032301978';
        obj['page_id'] = jQ(this).data('id').replace('snippet-', '');
        obj['components'] = product_id;
        params[i] = obj;
    });

    POWERREVIEWS.display.render(params);
};

// Build Default layout
BCSfFilter.prototype.buildDefaultElements = function () { var isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream, isSafari = /Safari/.test(navigator.userAgent), isBackButton = window.performance && window.performance.navigation && 2 == window.performance.navigation.type; if (!(isiOS && isSafari && isBackButton)) { var self = this, url = window.location.href.split("?")[0], searchQuery = self.isSearchPage() && self.queryParams.hasOwnProperty("q") ? "&q=" + self.queryParams.q : ""; window.location.replace(url + "?view=bc-original" + searchQuery) } };

function customizeJsonProductData(data) { for (var i = 0; i < data.variants.length; i++) { var variant = data.variants[i]; var featureImage = data.images.filter(function (e) { return e.src == variant.image; }); if (featureImage.length > 0) { variant.featured_image = { "id": featureImage[0]['id'], "product_id": data.id, "position": featureImage[0]['position'], "created_at": "", "updated_at": "", "alt": null, "width": featureImage[0]['width'], "height": featureImage[0]['height'], "src": featureImage[0]['src'], "variant_ids": [variant.id] } } else { variant.featured_image = ''; }; }; var self = bcsffilter; var itemJson = { "id": data.id, "title": data.title, "handle": data.handle, "vendor": data.vendor, "variants": data.variants, "url": self.buildProductItemUrl(data), "options_with_values": data.options_with_values, "images": data.images, "images_info": data.images_info, "available": data.available, "price_min": data.price_min, "price_max": data.price_max, "compare_at_price_min": data.compare_at_price_min, "compare_at_price_max": data.compare_at_price_max }; return itemJson; };
BCSfFilter.prototype.prepareProductData = function (data) { var self = this; var countData = data.length; for (var k = 0; k < countData; k++) { data[k]["images"] = data[k]["images_info"]; if (data[k]["images"].length > 0) { data[k]["featured_image"] = data[k]["images"][0] } else { data[k]["featured_image"] = { src: bcSfFilterConfig.general.no_image_url, width: "", height: "", aspect_ratio: 0 } } data[k]["url"] = "/products/" + data[k].handle; var optionsArr = []; var countOptionsWithValues = data[k]["options_with_values"].length; for (var i = 0; i < countOptionsWithValues; i++) { optionsArr.push(data[k]["options_with_values"][i]["name"]) } data[k]["options"] = optionsArr; var firstVariant = data[k]["variants"][0]; var isRoundedPrice = true; if (firstVariant.hasOwnProperty("fulfillment_service") && firstVariant.fulfillment_service == "gift_card") { isRoundedPrice = false } if (typeof self.convertPriceBasedOnActiveCurrency !== "undefined") { data[k].price_min = self.convertPriceBasedOnActiveCurrency(data[k].price_min, isRoundedPrice); data[k].price_max = self.convertPriceBasedOnActiveCurrency(data[k].price_max, isRoundedPrice); data[k].compare_at_price_min = self.convertPriceBasedOnActiveCurrency(data[k].compare_at_price_min, isRoundedPrice); data[k].compare_at_price_max = self.convertPriceBasedOnActiveCurrency(data[k].compare_at_price_max, isRoundedPrice) } data[k]["price_min"] *= 100, data[k]["price_max"] *= 100; if (data[k]["compare_at_price_min"] != null) { data[k]["compare_at_price_min"] *= 100 } if (data[k]["compare_at_price_max"] != null) { data[k]["compare_at_price_max"] *= 100 } data[k]["price"] = data[k]["price_min"]; data[k]["compare_at_price"] = data[k]["compare_at_price_min"]; data[k]["price_varies"] = data[k]["price_min"] != data[k]["price_max"]; if (getParam("variant") !== null && getParam("variant") != "") { var paramVariant = data[k]["variants"].filter(function (e) { return e.id == getParam("variant") }); if (typeof paramVariant[0] !== "undefined") firstVariant = paramVariant[0] } else { var countVariants = data[k]["variants"].length; for (var i = 0; i < countVariants; i++) { if (data[k]["variants"][i].available) { firstVariant = data[k]["variants"][i]; break } } } data[k]["selected_or_first_available_variant"] = firstVariant; var countVariants = data[k]["variants"].length; for (var i = 0; i < countVariants; i++) { var variantOptionArr = []; var count = 1; var variant = data[k]["variants"][i]; var variantOptions = variant["merged_options"]; if (Array.isArray(variantOptions)) { var countVariantOptions = variantOptions.length; for (var j = 0; j < countVariantOptions; j++) { var temp = variantOptions[j].split(":"); data[k]["variants"][i]["option" + (parseInt(j) + 1)] = temp[1]; data[k]["variants"][i]["option_" + temp[0]] = temp[1]; variantOptionArr.push(temp[1]) } data[k]["variants"][i]["options"] = variantOptionArr } if (data[k]["variants"][i]["compare_at_price"] != null) { var variantCompareAtPrice = parseFloat(data[k]["variants"][i]["compare_at_price"]); if (typeof self.convertPriceBasedOnActiveCurrency !== "undefined") { variantCompareAtPrice = self.convertPriceBasedOnActiveCurrency(variantCompareAtPrice, isRoundedPrice) } data[k]["variants"][i]["compare_at_price"] = variantCompareAtPrice * 100 } var variantPrice = parseFloat(data[k]["variants"][i]["price"]); if (typeof self.convertPriceBasedOnActiveCurrency !== "undefined") { variantPrice = self.convertPriceBasedOnActiveCurrency(variantPrice, isRoundedPrice) } data[k]["variants"][i]["price"] = variantPrice * 100 } data[k]["description"] = data[k]["content"] = data[k]["body_html"]; if (data[k].hasOwnProperty("original_tags") && data[k]["original_tags"].length > 0) { data[k]["tags"] = data[k]["original_tags"].slice(0) } data[k]["json"] = customizeJsonProductData(data[k]) } return data };

/* Begin patch boost-010 run 2 */
BCSfFilter.prototype.initFilter = function () { return this.isBadUrl() ? void (window.location.href = window.location.pathname) : (this.updateApiParams(!1), void this.getFilterData("init")) }, BCSfFilter.prototype.isBadUrl = function () { try { var t = decodeURIComponent(window.location.search).split("&"), e = !1; if (t.length > 0) for (var i = 0; i < t.length; i++) { var n = t[i], a = (n.match(/</g) || []).length, r = (n.match(/>/g) || []).length, o = (n.match(/alert\(/g) || []).length, h = (n.match(/execCommand/g) || []).length; if (a > 0 && r > 0 || a > 1 || r > 1 || o || h) { e = !0; break } } return e } catch (l) { return !0 } };
/* End patch boost-010 run 2 */
