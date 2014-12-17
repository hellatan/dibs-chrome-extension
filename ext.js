var $ = Sizzle;
var githubUriPR = 'https://github.com/pulls';
var filterSets;
// is:pr user:1stdibs milestone:5.5 is:open 
var filters = {
    'is': 'is',
    'user': 'user',
    'milestone': 'milestone'
};

// https://github.com/pulls?q=is%3Apr+user%3A1stdibs+milestone%3A5.5+is%3Aclosed 

var helpers = {
    createFilterUrl: function (uri, values) {
        var ret = uri;
        if (Array.isArray(values)) {
            values = encodeURIComponent(values.join(' '));
            ret += '?q=' + values; 
        }
        return ret;
    },
    filterMilestone: function (e) {
        e.preventDefault();
        // var qsVals = [filters.is + ':pr', filters.user + ':1stdibs']
        // var milestone = this.getMilestone();
        // var url;
        // if (!milestone) {
        //     alert('please input a value');
        //     return false;
        // }
        // qsVals.push(filters.milestone + ':' + milestone);
        // url = this.createFilterUrl(qsVals);
        // window.open()
        filterSets.milestonePRs();
        return false;
    },
    open: function (url) {
        if (!url) {
            alert('You must pass in an url');
            return false;
        }
        window.open(url);
    }
};

function filterChecked(item) {
    return item.checked === true;
}

filterSets = {
    getEl: function (el) {
        return $(el);
    },
    getMilestone: function () {
        return this.getEl('#formMilestoneInput')
    },
    getStatus: function () {
        return this.getEl('#formStatus > input[type=radio]');
    },
    getMilestoneValue: function () {
        var $el = this.getMilestone();
        return $el.length ? $el[0].value : '';
    },
    getStatusValue: function () {
        var $radios = this.getStatus();
        var value = $radios.filter(filterChecked);
        return value.length ? value[0].value : ''
    },
    errorMessages: {
        'milestone': 'you must input a milestone',
        'status': 'you must select a status'
    },
    error: function (action, err) {
        this[action.toLowerCase() + 'Error'](err);
    },
    showError: function (err) {
        var msg = this.errorMessages[err] || '';
        var $el;
        if (err === 'milestone') {
            $el = this.getMilestone();
        } else if (err === 'status') {
            $el = this.getStatus();
        }
        if ($el.length) {
            $el[0].parentNode.classList.add('err');
            // $el.forEach(function (item) {
            //     item.classList.add('err');
            // });
        }
    },
    removeError: function (err) {
        if (err === 'milestone') {
            $el = this.getMilestone();
        } else if (err === 'status') {
            $el = this.getStatus();
        }
        if ($el.length) {
            $el[0].parentNode.classList.remove('err');
            // $el.forEach(function (item) {
            //     if (this.hasClass($el, 'err')) {
            //         item.classList.remove('err');
            //     }
            // }).bind(this);
        }
    },
    hasClass: function ($el, _class) {
        var el = $el[0];
        if ($el.length && el.classList.indexOf(_class) > -1) {
            el.classList.remove(_class);
        }
    },
    handleMilestoneState: function (milestone) {
        if (!milestone) {
            this.showError('milestone');
            return false;
        }
        this.removeError('milestone');
        return true;
    },
    handleStatusState: function (status) {
        if (!status) {
            this.showError('status');
            return false;
        }
        this.removeError('status');
        return true;
    },
    milestonePRs: function () {
        var milestone = this.getMilestoneValue();
        var status = this.getStatusValue();
        var qsVals = [];
        var filterValues = {};
        var url;
        var validMilestone = this.handleMilestoneState(milestone);
        var validStatus = this.handleStatusState(status);
        if (!validMilestone || !validStatus) {
            return false;
        }
        filterValues[filters.user] = '1stdibs';
        filterValues[filters.is] = status;
        filterValues[filters.milestone] = milestone;
        Object.keys(filterValues).forEach(function (key) {
            var filter = key + ':' + filterValues[key];
            qsVals.push(filter);
        });
        url = helpers.createFilterUrl(githubUriPR, qsVals);
        window.open(url);
    }
};

function init() {
    document
        .getElementById('formMilestoneSearch')
        .addEventListener('click', helpers.filterMilestone.bind(helpers));
}

// Run our kitten generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    init();
});

