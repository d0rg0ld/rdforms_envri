#!/bin/bash

OLD=$1
NEW=$2

#echo $OLD
#echo $NEW
char=".";
for f in `ls ${OLD}.*`;do
	#echo $f;
	nc=`echo ${f} | awk -F"${char}" '{print NF-1}'`;
	#echo ${nc};
	if [ ${nc} -lt 2 ]; then
		newf="${f##*.}";
		echo ${NEW}.${newf};
		cp ${OLD}.${newf} ${NEW}.${newf};
		sed -i "s/${OLD}/${NEW}/g" ${NEW}.${newf};
	fi;
done;
		
