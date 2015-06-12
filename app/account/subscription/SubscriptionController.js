/*jslint
 browser: true,
 devel:true ,
 node:true,
 nomen: true,
 es5:true
 */

/**
 * @auth Ann Shumilova
 * @date
 * Controller for manipulating subscriptions.
 */
angular.module('odeskApp')
    .controller('SubscriptionCtrl', ["$scope", "AccountService", "$modal", "$location", function ($scope, AccountService, $modal, $location) {
        var cancelPayAsYouGoTooltip = "Remove your credit card to return to a SaaS Free Account.";
        var cancelPrePaidTooltip = "Cancel your pre-paid subscription.";
        var cancelOnPromisesTooltip = "Cancel your on-prem subscription.";

        var cancelPayAsYouGoLink = "#/account/billing";
        var cancelPrePaidLink = "mailto:sales@codenvy.com?subject=" + escape("Cancellation of Pre-Paid Subscription");
        var cancelOnPromisesLink = "mailto:sales@codenvy.com?subject=" + escape("Cancellation of On-Prem Subscription");

        var payAsYouGoDescription="SaaS Pay-as-you-Go Account";
        var prePaidDescription="SaaS Pre-Paid Subscription";


        $scope.accounts = [];
        $scope.subscriptions = [];

        AccountService.getAccountsByRole("account/owner").then(function (accounts) {
            $scope.accounts = accounts;
            if (accounts && accounts.length > 0) {
                $scope.loadSubscriptions(accounts);
            }
        });

        $scope.loadSubscriptions = function (accounts) {
            AccountService.getAllSubscriptions(accounts).then(function () {
                $scope.subscriptions = AccountService.subscriptions;
                angular.forEach($scope.subscriptions, function(subscription) {
                    if (subscription.serviceId === AccountService.SAAS_SERVICE_ID) {
                        var prepaidGbH = 0;
                        if(subscription.properties.PrepaidGbH) {
                            prepaidGbH = parseInt(subscription.properties.PrepaidGbH);
                        }
                        if(prepaidGbH > 0) {
                            subscription.cancelTooltip = cancelPrePaidTooltip;
                            subscription.cancelLink = cancelPrePaidLink;
                            subscription.description = prePaidDescription + " (" + prepaidGbH + "GB Hrs / Month)";
                        } else {
                            subscription.cancelTooltip = cancelPayAsYouGoTooltip;
                            subscription.cancelLink = cancelPayAsYouGoLink;
                            subscription.description = payAsYouGoDescription;
                        }
                    } else if (subscription.serviceId === AccountService.ONPREMISES_SERVICE_ID) {
                        subscription.cancelTooltip = cancelOnPromisesTooltip;
                        subscription.cancelLink = cancelOnPromisesLink;
                    }
                });
                $scope.addSubscriptionProposals();
            });
        };

        $scope.addSubscriptionProposals = function () {
            var services = _.pluck($scope.subscriptions, "serviceId");
            var hasOnPremises = services.indexOf(AccountService.ONPREMISES_SERVICE_ID) >= 0;
            var hasSaas = services.indexOf(AccountService.SAAS_SERVICE_ID) >= 0;

            if (!hasSaas) {
                $scope.subscriptions.push(AccountService.getSAASProposalSubscription());
            }

            if (!hasOnPremises) {
                $scope.subscriptions.push(AccountService.getOnPremisesProposalSubscription());
            }
        };

        $scope.buySubscription = function(subscription) {
            if (subscription.serviceId === AccountService.SAAS_SERVICE_ID) {
                $location.path("/account/billing");
            } else if (subscription.serviceId === AccountService.ONPREMISES_SERVICE_ID) {
                $modal.open({
                    templateUrl: 'account/subscription/buyOnPremSubscriptionModal.html',
                    size: 'lg',
                    scope: $scope,
                    subscription: subscription
                }).result;
            }
        }

        $scope.confirmCancelSubscription = function (subscription) {
            $scope.subscription = subscription;
            $modal.open({
                templateUrl: 'account/subscription/cancelSubscriptionModal.html',
                size: 'lg',
                scope: $scope,
                subscription: subscription
            }).result;
        }
    }]);
