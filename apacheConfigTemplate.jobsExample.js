module.exports = function apacheConfigTemplate(repos, branchName, config) {
  let whitelist = [];
  try {
    whitelist = require("./whitelist.json");
  } catch (e) { }
  const { buildPath, testDomain, apacheLogDir } = config;
  const whiteListIdx = Array.isArray(whitelist)
    ? whitelist.map(({ branch }) => branch).indexOf(branchName)
    : -1;
  const subdomain =
    whiteListIdx !== -1 ? whitelist[whiteListIdx].subdomain : branchName;

  const jobsBranch = repos.some(obj => obj.repo === 'm-ksl-jobs') ? branchName : 'master';
  const myAccountBranch = repos.some(obj => obj.repo === 'm-ksl-myaccount') ? branchName : 'master';
  return `
    <VirtualHost *:80>
      ServerName ${subdomain}.api.${testDomain}

      DocumentRoot "${buildPath}/branch_ksl-api_${jobsBranch}/public_html"

      <Directory ${buildPath}>
        Options FollowSymLinks
        AllowOverride All
        Order allow,deny
        allow from all
        Require all granted
      </Directory>

      php_value display_errors Off
      php_value error_reporting 22519
      php_flag short_open_tag on

      ErrorLog ${apacheLogDir}/api.${subdomain}.${testDomain}.error.log

      SetEnv KSL_API_ENV test
      SetEnv CUSTOM_SUBDOMAIN ${subdomain}
    </VirtualHost>
    <VirtualHost *:443>
      ServerName ${subdomain}.api.${testDomain}

      DocumentRoot "${buildPath}/branch_ksl-api_${jobsBranch}/public_html"

      <Directory ${buildPath}>
        Options FollowSymLinks
        AllowOverride All
        Order allow,deny
        allow from all
        Require all granted
      </Directory>

      php_value display_errors Off
      php_value error_reporting 22519
      php_flag short_open_tag on

      ErrorLog ${apacheLogDir}/api.${subdomain}.${testDomain}.error.log

      SetEnv KSL_API_ENV test
      SetEnv CUSTOM_SUBDOMAIN ${subdomain}

      Include /etc/apache2/configs/test-ssl.conf

    </VirtualHost>
    <VirtualHost *:80>
      ServerAdmin webmaster@localhost
      ServerName ${subdomain}.${testDomain}
      RewriteEngine On
      RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
    </VirtualHost>
    <VirtualHost *:443>
      ServerAdmin webmaster@localhost
      ServerName ${subdomain}.${testDomain}

      UseCanonicalName off
      DocumentRoot /export/ksl/v2
      
      <Directory /export/ksl/v2>
        Options FollowSymLinks
        AllowOverride All
        Order allow,deny
        allow from all
        Require all granted
      </Directory>
	
		            
      <Directory ${buildPath}>
        Options FollowSymLinks
        AllowOverride All
        Order allow,deny
        allow from all
        Require all granted
      </Directory>

      <IfModule mod_dir.c>
        DirectoryIndex index.php index.html index.xhtml index.htm
      </IfModule>

      ExpiresActive on
      ExpiresDefault "now plus 5 minutes"

      AddOutputFilterByType DEFLATE text/css application/x-javascript
      BrowserMatch "^" no-gzip
      BrowserMatch "\bGooglebot" !no-gzip
      BrowserMatch "\bFirefox.3" !no-gzip
      BrowserMatch "\bMSIE.7" !no-gzip
      BrowserMatch "\bMSIE.8" !no-gzip
      BrowserMatch "\bSafari.3" !no-gzip
      RewriteEngine On
      RewriteRule \/emedia\/(.*) /emedia/emedia.php [PT,E=media:$1,E=col:slc]
      Alias /emedia/ /var/local/scripts/
      RewriteRule ^\/deals/?(.*)$ /public/deal/todaysdeals/$1

      # Zend Homes
      RewriteRule ^\/homes/css/(.*)$ /homes/public/css/$1 [L]
      RewriteRule ^\/homes/images/(.*)$ /homes/public/images/$1 [L]
      RewriteRule ^\/homes/js/(.*)$ /homes/public/js/$1 [L]
      RewriteRule ^\/homes/aux/(.*)$ /homes/public/aux/$1 [L]
      RewriteRule ^\/homes/(.*)$ /homes/public/index.php/$1 [L]

      # My Account
      RewriteRule ^\/myaccount/css/(.*)$ ${buildPath}/branch_m-ksl-myaccount_${myAccountBranch}/public/css/$1 [L]
      RewriteRule ^\/myaccount/images/(.*)$ ${buildPath}/branch_m-ksl-myaccount_${myAccountBranch}/public/images/$1 [L]
      RewriteRule ^\/myaccount/js/(.*)$ ${buildPath}/branch_m-ksl-myaccount_${myAccountBranch}/public/js/$1 [L]
      RewriteRule ^\/myaccount/aux/(.*)$ ${buildPath}/branch_m-ksl-myaccount_${myAccountBranch}/public/aux/$1 [L]
      RewriteRule ^\/myaccount/(.*)$ ${buildPath}/branch_m-ksl-myaccount_${myAccountBranch}/public/index.php/$1 [L]

      # KSL
      RewriteRule ^(.*)\.rev[0123456789]+\.(css|js|jpg|gif|png) $1.$2 [QSA]
      RewriteRule ^\/homes/([0-9]+)$ http://www.ksl.com/index.php?nid=475&ad=$1 [L]
      RewriteRule ^\/fly$ http://www.ksl.com/public/contest/listing/31 [L]
      RewriteRule ^\/healthbreak$ http://www.ksl.com/index.php?sid=10643683&nid=322 [L]
      RewriteRule ^\/symphony$ http://www.ksl.com/?sid=11665439&nid=322 [L]
      RewriteRule ^\/weatherchannel$ http://www.ksl.com/index.php?nid=656
      RewriteRule \/(.*)\/rss_(.*)\.xml$ /index.php [E=run:$1/rss.php,E=params:$2]
      RewriteRule \/(.*)xml\/(.*)\.(.*) /xml/index.php [E=path:$1,E=nid:$2,E=ext:$3]
      RewriteRule ^/(radio|2002)/(.*)\.(gif|jpg) http://web.ksl.com/$1/$2.$3 [L]
      RewriteCond %{REQUEST_URI} ^/(radio|TV|dmc_site|dump|phputil|ksl_radio|ksl_com|ksl_tv|ascer).*
      RewriteRule (.*) http://web.ksl.com$1 [L]
      RewriteCond %{DOCUMENT_ROOT}/%{REQUEST_FILENAME} !-d
      RewriteCond %{DOCUMENT_ROOT}/%{REQUEST_FILENAME} !-f
      RewriteRule ^\/public/(.*)$ /index.php [L,E=dado:public/$1]

      # Zend Jobs
      RewriteRule ^\/([^/.]+\\.[^/.]+)$ ${buildPath}/branch_m-ksl-jobs_${jobsBranch}/site/public/static/$1 [L]
      RewriteRule ^\/(css|images|js|aux)/(.*)$ ${buildPath}/branch_m-ksl-jobs_${jobsBranch}/site/public/$1/$2 [L]
      RewriteRule ^\/(.*)$ ${buildPath}/branch_m-ksl-jobs_${jobsBranch}/site/public/index.php/$1 [L]

      # Zend Cars
      RewriteRule ^\/auto/(css|images|js|aux)/(.*)$ ${buildPath}/branch_m-ksl-cars_${jobsBranch}/public/$1/$2 [L]
      RewriteRule ^\/(css|images|js|aux)/(.*)$ ${buildPath}/branch_m-ksl-cars_${jobsBranch}/public/$1/$2 [L]
      RewriteRule ^\/auto/(.*)$ ${buildPath}/branch_m-ksl-cars_${jobsBranch}/public/index.php/$1 [L]
      RewriteRule ^\/(.*)$ ${buildPath}/branch_m-ksl-cars_${jobsBranch}/public/index.php/$1 [L]

      php_flag display_errors 1
      php_flag log_errors 1
      #php_value error_log /var/log/apache2
      #php_value error_reporting 22519
      php_flag short_open_tag on
      php_flag register_globals on
      php_flag output_buffering on
      ErrorLog ${apacheLogDir}/${subdomain}.${testDomain}.error.log
      CustomLog ${apacheLogDir}/${subdomain}.${testDomain}.access.log combined

      Include /etc/apache2/configs/test-ssl.conf

      # php_admin_value auto_prepend_file "/var/www/xhgui/external/header.php"

      SetEnv KSL_API_ENV test
      SetEnv CUSTOM_SUBDOMAIN ${subdomain}
    </VirtualHost>
  `;
}
