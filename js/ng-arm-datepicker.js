
/*
 * ARMDatePicker created by Arman Hoseini, 2016.(Jean Valjean)
 * 
 * Inject ARMDatePicker in ur module and use directive.
 * You can use ARMCalendar for manage Jalali and gregorian dates.
 */

var aHDatePicker = angular.module('AHDatePicker', []);

aHDatePicker.factory("ARMCalendar", function () {


    function div(a, b) {
        return ~~(a / b)
    }

    function mod(a, b) {
        return a - ~~(a / b) * b
    }

    function jalCal(jy) {
        // Jalaali years starting the 33-year rule.
        var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210
                      , 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
        ]
          , bl = breaks.length
          , gy = jy + 621
          , leapJ = -14
          , jp = breaks[0]
          , jm
          , jump
          , leap
          , leapG
          , march
          , n
          , i

        if (jy < jp || jy >= breaks[bl - 1])
            throw new Error('Invalid Jalaali year ' + jy)

        // Find the limiting years for the Jalaali year jy.
        for (i = 1; i < bl; i += 1) {
            jm = breaks[i]
            jump = jm - jp
            if (jy < jm)
                break
            leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
            jp = jm
        }
        n = jy - jp

        // Find the number of leap years from AD 621 to the beginning
        // of the current Jalaali year in the Persian calendar.
        leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
        if (mod(jump, 33) === 4 && jump - n === 4)
            leapJ += 1

        // And the same in the Gregorian calendar (until the year gy).
        leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150

        // Determine the Gregorian date of Farvardin the 1st.
        march = 20 + leapJ - leapG

        // Find how many years have passed since the last leap year.
        if (jump - n < 6)
            n = n - jump + div(jump + 4, 33) * 33
        leap = mod(mod(n + 1, 33) - 1, 4)
        if (leap === -1) {
            leap = 4
        }

        return {
            leap: leap
                , gy: gy
                , march: march
        }
    }

    function d2j(jdn) {
        var gy = d2g(jdn).gy // Calculate Gregorian year (gy).
          , jy = gy - 621
          , r = jalCal(jy)
          , jdn1f = g2d(gy, 3, r.march)
          , jd
          , jm
          , k

        // Find number of days that passed since 1 Farvardin.
        k = jdn - jdn1f
        if (k >= 0) {
            if (k <= 185) {
                // The first 6 months.
                jm = 1 + div(k, 31)
                jd = mod(k, 31) + 1
                return {
                    jy: jy
                        , jm: jm
                        , jd: jd
                }
            } else {
                // The remaining months.
                k -= 186
            }
        } else {
            // Previous Jalaali year.
            jy -= 1
            k += 179
            if (r.leap === 1)
                k += 1
        }
        jm = 7 + div(k, 30)
        jd = mod(k, 30) + 1
        return {
            jy: jy
                , jm: jm
                , jd: jd
        }
    }

    function d2g(jdn) {
        var j
          , i
          , gd
          , gm
          , gy
        j = 4 * jdn + 139361631
        j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
        i = div(mod(j, 1461), 4) * 5 + 308
        gd = div(mod(i, 153), 5) + 1
        gm = mod(div(i, 153), 12) + 1
        gy = div(j, 1461) - 100100 + div(8 - gm, 6)
        return {
            gy: gy
                , gm: gm
                , gd: gd
        }
    }

    function j2d(jy, jm, jd) {
        var r = jalCal(jy)
        return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
    }

    function g2d(gy, gm, gd) {
        var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
            + div(153 * mod(gm + 9, 12) + 2, 5)
            + gd - 34840408
        d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
        return d
    }

    /*
      Converts a Gregorian date to Jalaali.
    */
    function toJalaali(gy, gm, gd) {
        return d2j(g2d(gy, gm, gd));
    }

    /*
      Converts a Jalaali date to Gregorian.
    */
    function toGregorian(jy, jm, jd) {
        return d2g(j2d(jy, jm, jd));
    }


    function jalaliToGregorian(jalaliDate) {
        //return d2g(j2d(jy, jm, jd));
        if (!jalaliDate)
            throw 'ARMDatePicker: Please pass date parameter!';

        if (typeof (jalaliDate) == 'object') {
            if (!isValidJalaaliDate(jalaliDate.Year, jalaliDate.Month, jalaliDate.Day))
                throw 'ARMDatePicker: Date parameter not valid!';
            var result = d2g(j2d(jalaliDate.Year, jalaliDate.Month, jalaliDate.Day));
            return {
                Year: result.gy,
                Month: result.gm,
                Day: result.gd
            };
        } else if (typeof (jalaliDate) == 'string') {
            var splitedDate = jalaliDate.split('/');
            if (!isValidJalaaliDate(parseInt(splitedDate[0]), parseInt(splitedDate[1]), parseInt(splitedDate[2])))
                throw 'ARMDatePicker: Date parameter not valid! (by format :"yyyy/mm/dd")';
            if (splitedDate.length == 3) {
                var result = d2g(j2d(parseInt(splitedDate[0]), parseInt(splitedDate[1]), parseInt(splitedDate[2])));
                return result.gy + '/' + result.gm + '/' + result.gd;
            }
        } else {
            throw 'ARMDatePicker: Date parameter is not in correct format(please pass string or object of ARMDate{Year:val,Month:val,Day:val})';
        }
    }
    function gregorianToJalali(grogorianDate) {
        if (!grogorianDate)
            throw 'ARMDatePicker: Please pass date parameter!'

        if (typeof (grogorianDate) == 'object') {
            if (!isValidGregorianDate(grogorianDate.Year, grogorianDate.Month, grogorianDate.Day))
                throw 'ARMDatePicker: Date parameter not valid!';
            var result = d2j(g2d(grogorianDate.Year, grogorianDate.Month, grogorianDate.Day));
            return {
                Year: result.jy,
                Month: result.jm,
                Day: result.jd
            };
        } else if (typeof (grogorianDate) == 'string') {
            var splitedDate = grogorianDate.split('/');
            if (!isValidGregorianDate(parseInt(splitedDate[0]), parseInt(splitedDate[1]), parseInt(splitedDate[2])))
                throw 'ARMDatePicker: Date parameter not valid! (by format :"yyyy/mm/dd")';
            if (splitedDate.length == 3) {
                var result = d2j(g2d(parseInt(splitedDate[0]), parseInt(splitedDate[1]), parseInt(splitedDate[2])));
                return result.jy + '/' + result.jm + '/' + result.jd;
            }
        } else {
            throw 'ARMDatePicker: Date parameter is not valid(please pass string or object of ARMDate{Year:val,Month:val,Day:val})';
        }
    }


    function isLeapJalaaliYear(jy) {
        return jalCal(jy).leap === 0
    }

    function jalaaliMonthLength(jy, jm) {
        if (jm <= 6) return 31
        if (jm <= 11) return 30
        if (isLeapJalaaliYear(jy)) return 30
        return 29
    }

    function gregorianMonthLength(gy, gm) {
        var isleap = (gy % 4 == 0 && (gy % 100 != 0 || gy % 400 == 0));
        switch (gm) {
            case 4:
            case 6:
            case 9:
            case 11:
                return 30;
            case 2:
                return isleap ? 29 : 28;
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                return 31;
        }
    }

    function isValidJalaaliDate(jy, jm, jd) {
        return jy >= -61 && jy <= 3177 &&
                jm >= 1 && jm <= 12 &&
                jd >= 1 && jd <= jalaaliMonthLength(jy, jm)
    }

    function isValidGregorianDate(gy, gm, gd) {
        return gy >= 1400 && gy <= 3016 &&
                gm >= 1 && gm <= 12 &&
                gd >= 1 && gd <= gregorianMonthLength(gy, gm)
    }

    var nowDate = new Date();

    function nowInGregorian() {
        var gDateObject = {
            Year: nowDate.getFullYear(),
            Month: nowDate.getMonth() + 1,
            Day: nowDate.getDate()
        }
        return gDateObject;
    }

    function nowInJalaali() {
        var nowG = nowInGregorian();

        var jCurrentDate = toJalaali(nowG.Year, nowG.Month, nowG.Day);
        return {
            Year: jCurrentDate.jy,
            Month: jCurrentDate.jm,
            Day: jCurrentDate.jd
        }
    }
    var weekDayList = [1, 2, 3, 4, 5, 6, 0];
    function getDayOfWeek(jalaliDateObject) {
        var gDate = toGregorian(jalaliDateObject.Year, jalaliDateObject.Month, jalaliDateObject.Day);
        var dateObject = new Date(gDate.gm + '/' + gDate.gd + '/' + gDate.gy);
        return weekDayList[dateObject.getDay()];
    }

    var jMonths = ('فروردین_اردیبهشت_خرداد_تیر_مرداد_شهریور_مهر_آبان_آذر_دی_بهمن_اسفند').split('_');
    var jWeekDays = ('شنبه_یک شنبه_دوشنبه_سه شنبه_چهارشنبه_پنج شنبه_جمعه').split('_');
    var gMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    var gWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');


    return {
        toJalaali: toJalaali,
        toGregorian: toGregorian,
        jalaliToGregorian: jalaliToGregorian,
        gregorianToJalali: gregorianToJalali,
        isLeapJalaaliYear: isLeapJalaaliYear,
        isValidJalaaliDate: isValidJalaaliDate,
        jalaaliMonthLength: jalaaliMonthLength,
        jalaaliMonths: jMonths,
        jalaaliWeekDays: jWeekDays,
        gregorianMonths: gMonths,
        gregorianWeekDays: gWeekdays,
        nowInGregorian: nowInGregorian,
        nowInJalaali: nowInJalaali,
        getDayOfWeek: getDayOfWeek
    }
});



/*
 * How to use:
 <arm-date-picker ng-model="$parent.urModel"
                  source-object="urSourceDateObject"
                  culture="fa/en"
                  position="top/bottom"
                  [on-change="urChangeFunction"]></arm-date-picker>
 */
/*
 * 
 */
aHDatePicker.directive('armDatePicker', ['ARMCalendar', function (ARMCalendar) {




    return {
        restrict: 'E',
        templateUrl: '../templates/ng-arm-datepicker.html',
        scope: {
            sourceObject: '=',
            ngModel: '=',
            culture: '@',
            position: '@',
            onChange: '&onChange'
        },
        link: function (scope, element, attributes) {

            var onChangeFunction = scope.onChange();
            function dateChanged(dateObj, dateStr) {
                if (onChangeFunction) {
                    scope.ngModel = dateStr;
                    setTimeout(function () {
                        onChangeFunction(dateObj, dateStr);
                    }, 0);
                }

            }

            var currentDate = ARMCalendar.nowInJalaali();

            var defaults = {
                currentDate: currentDate,
                selectedDate: currentDate,
                countOfYearsAfterCurrentDate: 10,
                countOfYearsBeforeCurrentDate: 10
            };

            var beforeCount = 10,
                            afterCount = 10,
                            startYear = currentDate.Year;

            function initial() {
                if (!scope.sourceObject) {
                    throw 'AHDatePicker: source-object attribute is undefined!';
                } else {
                    for (var i in defaults) {
                        if (typeof scope.sourceObject[i] == "undefined")
                            scope.sourceObject[i] = defaults[i];
                    }
                }

                if (!scope.culture) {
                    throw 'AHDatePicker: culture attribute is undefined!';
                } else {
                    if (!(scope.culture.toLowerCase() == 'en' || scope.culture.toLowerCase() == 'fa')) {
                        throw 'AHDatePicker: Invalid culture attribute!';
                    }
                }

                if (!scope.position) {
                    scope.position = 'bottom';
                } else {
                    if (!(scope.position.toLowerCase() == 'top' || scope.position.toLowerCase() == 'bottom')) {
                        throw 'AHDatePicker: Invalid position attribute!';
                    }
                }

                var beforeCount = scope.sourceObject.countOfYearsBeforeCurrentDate,
                            afterCount = scope.sourceObject.countOfYearsBeforeCurrentDate,
                            startYear = scope.sourceObject.currentDate.Year;

                scope.selectedDate = {
                    Year: 0,
                    Month: 0,
                    Day: 0
                }

                scope.years = [];
                for (var y = scope.sourceObject.currentDate.Year - scope.sourceObject.countOfYearsBeforeCurrentDate;
                    y <= scope.sourceObject.currentDate.Year + scope.sourceObject.countOfYearsAfterCurrentDate; y++) {
                    scope.years.push(y);
                }

                scope.selectedDate.Year = scope.sourceObject.selectedDate.Year;
                scope.months = scope.culture.toLowerCase() == 'fa' ? ARMCalendar.jalaaliMonths : ARMCalendar.gregorianMonths;
                scope.selectedDate.Month = scope.sourceObject.selectedDate.Month - 1;
                scope.selectedMonth = scope.months[scope.selectedDate.Month];

                scope.dayList = [];

                refreshDayList(scope.selectedDate.Year, scope.selectedDate.Month + 1)
                scope.selectedDate.Day = scope.sourceObject.selectedDate.Day;

                scope.today = scope.sourceObject.currentDate.Day;
                scope.selectedDateString = scope.selectedDate.Year + '/' + (scope.selectedDate.Month + 1) + '/' + scope.selectedDate.Day;
                prevDate = scope.selectedDateString;
                if (scope.ngModel == undefined) {
                    scope.ngModel = '';
                } else {
                    resetDirective(scope.ngModel);
                }

            }







            function refreshDayList(year, month) {
                scope.dayList.splice(0, scope.dayList.length);
                var weekDay = ARMCalendar.getDayOfWeek({ Year: year, Month: month, Day: 1 });
                for (var d = 1 - weekDay; d <= ARMCalendar.jalaaliMonthLength(year, month) ; d++) {
                    scope.dayList.push(d < 1 ? 0 : d);
                }

            }




            var prevDate = '';

            scope.datePickerOpened = false;
            scope.openDatePicker = function () {

                if (!scope.datePickerOpened) {
                    prevDate = scope.selectedDateString;
                    scope.datePickerOpened = !scope.datePickerOpened;
                } else {
                    if (scope.dateNotValid) {
                        scope.selectedDateString = prevDate;
                    } else {
                        if (prevDate == scope.selectedDateString) {
                            var dateParts = scope.selectedDateString.split('/');
                            scope.selectedDateString = prevDate;
                            scope.selectedDate.Day = parseInt(dateParts[2]);
                            scope.selectedMonth = scope.months[parseInt(dateParts[1]) - 1];
                            scope.selectedDate.Year = parseInt(dateParts[0])
                        }
                    }
                    scope.datePickerOpened = !scope.datePickerOpened;
                    setTimeout(function () {
                        scope.$apply();
                    }, 0);
                }

            };


            scope.daysOnclick = function (sender) {
                var dateParts = scope.selectedDateString.split('/');
                if (scope.dayList.indexOf(sender)) {
                    dateParts[0] = scope.selectedDate.Year;
                    dateParts[1] = scope.months.indexOf(scope.selectedMonth) + 1;
                    dateParts[2] = sender;
                    scope.selectedDateString = dateParts.join('/');
                    scope.ngModel = scope.selectedDateString;
                    scope.datePickerOpened = false;
                }
            }
            function resetDirective(newValue) {
                if (newValue.length > 0) {
                    var dateParts = newValue.split('/');
                    if (dateParts.length != 3) {
                        scope.dateNotValid = true;

                    } else {
                        var newYear = parseInt(dateParts[0]);
                        if (newYear && newYear >= startYear - beforeCount && newYear <= startYear + afterCount) {

                            if (ARMCalendar.isValidJalaaliDate(dateParts[0], dateParts[1], dateParts[2])) {
                                scope.dateNotValid = false;
                                scope.selectedDate.Day = parseInt(dateParts[2]);
                                scope.selectedMonth = scope.months[parseInt(dateParts[1]) - 1];
                                scope.selectedDate.Year = newYear;
                                scope.selectedDateString = scope.ngModel;
                                var dateToPass = {
                                    Year: newYear,
                                    Month: parseInt(dateParts[1]),
                                    Day: scope.selectedDate.Day
                                };
                                setTimeout(function () {
                                    scope.$apply();
                                }, 0);
                                dateChanged(dateToPass, scope.selectedDateString);
                            } else {

                                scope.dateNotValid = true;
                            }
                        } else {

                            scope.dateNotValid = true;
                        }
                    }
                }
            }


            scope.$watch('ngModel', function (newVal, oldVal) {
                if (scope.ngModel == undefined) {
                    scope.ngModel = '';
                    return;
                }
                if (newVal.length > 0) {
                    if (newVal != oldVal) {
                        resetDirective(newVal);
                    }
                } else {
                    scope.dateNotValid = false;
                }

            });
            initial();


            scope.faWeekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
            scope.enWeekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
            scope.weekDays = scope.culture.toLowerCase() == 'fa' ? angular.copy(scope.faWeekDays) : angular.copy(scope.enWeekDays);
            scope.direction = scope.culture.toLowerCase() == 'fa' ? 'rtl' : 'ltr';
            scope.$watch('culture', function () {
                scope.weekDays = scope.culture.toLowerCase() == 'fa' ? angular.copy(scope.faWeekDays) : angular.copy(scope.enWeekDays);
                scope.direction = scope.culture.toLowerCase() == 'fa' ? 'rtl' : 'ltr';
            });

            scope.dateNotValid = false;
            scope.$watch('selectedMonth', function (newMonth, oldMonth) {
                if (newMonth) {
                    if (oldMonth != newMonth) {
                        refreshDayList(scope.selectedDate.Year, scope.months.indexOf(scope.selectedMonth) + 1);
                    }
                }
            });

            scope.$watch('selectedDate.Year', function (newYear, oldYear) {
                if (oldYear != newYear) {
                    if (newYear && newYear >= startYear - beforeCount && newYear <= startYear + afterCount) {
                        refreshDayList(scope.selectedDate.Year, scope.months.indexOf(scope.selectedMonth) + 1);
                    }
                }
            });

            scope.$watch('selectedDate.Day', function (newDay, oldDay) {
                if (oldDay != newDay) {
                    if (scope.dayList.indexOf(newDay)) {
                    }
                }
            });

            scope.goToday = function () {
                scope.selectedDateString = scope.sourceObject.currentDate.Year + '/' + scope.sourceObject.currentDate.Month + '/' + scope.sourceObject.currentDate.Day;
                scope.datePickerOpened = false;
                scope.selectedDate.Year = scope.sourceObject.currentDate.Year;
                scope.selectedMonth = scope.months[scope.sourceObject.currentDate.Month - 1];
            }


            scope.$watch('sourceObject', function (newVal, oldVal) {
                initial();
            });


            document.onclick = function (e) {
                if (e.path) {
                    var clickOnDatePicker = false;
                    e.path.forEach(function (item, index) {
                        if (angular.element(item).hasClass('input-box') || angular.element(item).hasClass('picker-box')) {
                            clickOnDatePicker = true;
                            return;
                        }

                    });
                    if (!clickOnDatePicker) {
                        if (scope.datePickerOpened) {
                            scope.openDatePicker();
                        }
                    }
                }
            }

            scope.onDateInputBlur = function (e) {

                if (scope.ngModel.length > 0) {
                    if (!scope.dateNotValid) {
                        scope.selectedDateString = scope.ngModel;
                    } else {
                        scope.ngModel = scope.selectedDateString;
                        resetDirective(scope.selectedDateString);
                    }
                }
            }










        }
    }
}]);