#!/bin/sh

# A script emulating a behavior similar to sendmail, for manual testing. This
# will store the text content of the email in a temporary folder.

prefix="/tmp/mail/sendmail/new"
numPath="/tmp/mail/sendmail"

mkdir -p $prefix

if [ ! -f $numPath/num ]; then
    echo "0" > $numPath/num
fi

num=`cat $numPath/num`
num=$(($num + 1))
echo $num > $numPath/num

name="$prefix/letter_$num.txt"
while read line
do
    echo $line >> $name
done

chmod 755 $name

/bin/true
