#!/usr/local/bin/python

try:

	import os
	import os.path

	print "Content-Type: text/json\n"
	print "[",

	comma = False
	files = os.listdir("./docs/")
	files.sort()
	for file in files :
	    root, ext = os.path.splitext(file)
	    if ext == ".html" and file != "index.html" and file != "index_old.html" :
	    	print "%s\n\"%s\"" % ("," if comma else "", file),
	        comma = True
	print "]"

except:
    print "Unexpected error:", sys.exc_info()[0]
