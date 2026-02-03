<?php
echo "<h1>PHP Access OK</h1>";
echo "Current User: " . get_current_user() . "<br>";
echo "Script Access: " . fileperms(__FILE__);
