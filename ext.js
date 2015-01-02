var $ = Sizzle;
var githubUriPR = 'https://github.com/pulls';
var jiraIssues = 'https://1stdibs.atlassian.net/issues/?jql=fixVersion%20%3D%20{version}%20ORDER%20BY%20status%20ASC';
var filters = {
    'is': 'is',
    'user': 'user',
    'milestone': 'milestone'
};
var decimalRegexp = /^\d{1,2}(\.\d{1,2})+$/;
var filterSets;

var helpers = {
    createFilterUrl: function (uri, values) {
        var ret = uri;
        if (Array.isArray(values)) {
            values = encodeURIComponent(values.join(' '));
            ret += '?q=' + values; 
        }
        return ret;
    },
    filterValue: function (e, type) {
        type = (type || '').toLowerCase();
        if (type === 'milestone') {
            return this.filterMilestone(e);
        } else if (type === 'fixversion') {
            return this.filterFixVersion(e);
        }
    },
    filterFixVersion: function (e) {
        e.preventDefault();
        filterSets.fixVersionFilter();
        return false;
    },
    filterMilestone: function (e) {
        e.preventDefault();
        filterSets.milestonePRs();
        return false;
    }
};

function filterChecked(item) {
    return item.checked === true;
}

filterSets = {
    getEl: function (el) {
        return $(el);
    },
    getFixVersion: function () {
        return this.getEl('#formFixVersionInput')
    },
    getMilestone: function () {
        return this.getEl('#formMilestoneInput')
    },
    getStatus: function () {
        return this.getEl('#formStatus > input[type=radio]');
    },
    getFixVersionValue: function () {
        var $el = this.getFixVersion();
        return $el.length ? $el[0].value : '';
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
    showError: function (err) {
        var $el;
        switch (err.toLowerCase()) {
            case 'milestone':
                $el = this.getMilestone();
                break;
            case 'status':
                $el = this.getStatus();
                break
            case 'fixversion':
                $el = this.getFixVersion();
                break;
        }
        if ($el.length) {
            $el[0].parentNode.classList.add('err');
        }
    },
    removeError: function (err) {
        switch (err.toLowerCase()) {
            case 'milestone':
                $el = this.getMilestone();
                break;
            case 'status':
                $el = this.getStatus();
                break;
            case 'fixversion':
                $el = this.getFixVersion();
                break;
        }
        if ($el.length) {
            $el[0].parentNode.classList.remove('err');
        }
    },
    handleMilestoneState: function (milestone) {
        if (!milestone || !decimalRegexp.test(milestone)) {
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
    handleFixVersionState: function (fixVersion) {
        if (!fixVersion || !decimalRegexp.test(fixVersion)) {
            this.showError('fixVersion');
            return false;
        }
        this.removeError('fixVersion');
        return true;
    },
    validateMilestone: function () {
        var milestone = this.getMilestoneValue();
        var validMilestone = this.handleMilestoneState(milestone);
        if (!validMilestone) {
            return false;
        }
        return {
            value: milestone
        };
    },
    validateStatus: function () {
        var status = this.getStatusValue();
        var validStatus = this.handleStatusState(status);
        if (!validStatus) {
            return false;
        }
        return {
            value: status
        }
    },
    validateFixVersion: function () {
        var fixVersion = this.getFixVersionValue();
        var validFixVersion = this.handleFixVersionState(fixVersion);
        if (!validFixVersion) {
            return false;
        }
        return {
            value: fixVersion
        }
    },
    milestonePRs: function () {
        var milestone = this.validateMilestone();
        var status = this.validateStatus();
        var filterValues = {};
        var qsVals = [];
        var url;
        if (milestone && status) {
            filterValues[filters.user] = '1stdibs';
            filterValues[filters.is] = status.value;
            filterValues[filters.milestone] = milestone.value;
            Object.keys(filterValues).forEach(function (key) {
                var filter = key + ':' + filterValues[key];
                qsVals.push(filter);
            });
            url = helpers.createFilterUrl(githubUriPR, qsVals);
            this.goToUrl(url);
        }
    },
    fixVersionFilter: function () {
        var fixVersionInfo = this.validateFixVersion();
        var url;
        if (fixVersionInfo) {
            url = jiraIssues.replace('{version}', fixVersionInfo.value);
            this.goToUrl(url);
        }
    },
    goToUrl: function (url) {
        window.open(url);
    }
};

function init() {
    document
        .getElementById('formMilestoneSearch')
        .addEventListener('click', function (e) {
            helpers.filterValue(e, 'milestone');
        });
    document
        .getElementById('formFixVersionSearch')
        .addEventListener('click', function (e) {
            helpers.filterValue(e, 'fixVersion');
        });
}

document.addEventListener('DOMContentLoaded', function () {
    init();
});

