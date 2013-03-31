<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#">  
                            
    <!-- Internet Archive import XSL version 2.0 by Craig Dietrich -->                        
  
  	<!-- Variales -->
  
   	<xsl:variable name="archiveName">
		<xsl:text>Vimeo</xsl:text>
	</xsl:variable>     
  
 	<xsl:variable name="downloadBase">
		<xsl:text>http://player.vimeo.com/video/</xsl:text>
	</xsl:variable>    
  
  	<!-- Templates -->
  
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="/videos/video" />
		</rdf:RDF>		
	</xsl:template>  
	
	<xsl:template match="/videos/video">	
		<rdf:Description rdf:about="{url}">
			<dcterms:type>video</dcterms:type>
			<dcterms:source><xsl:value-of select="$archiveName"/></dcterms:source>
			<xsl:apply-templates />
		</rdf:Description>
	</xsl:template>
	
	<xsl:template match="*"></xsl:template>
      
	<xsl:template match="id">	
		<dcterms:identifier><xsl:value-of select="."/></dcterms:identifier>
		<art:filename rdf:resource="{$downloadBase}{.}"></art:filename>
	</xsl:template>  
	
	<xsl:template match="title">	
		<dcterms:title><xsl:value-of select="."/></dcterms:title>
	</xsl:template>    	    
   
	<xsl:template match="description">	
		<dcterms:description><xsl:value-of select="."/></dcterms:description>
	</xsl:template>      
    
	<xsl:template match="user_name">	
		<dcterms:contributor><xsl:value-of select="."/></dcterms:contributor>
	</xsl:template>        
   
	<xsl:template match="upload_date">	
		<dcterms:date><xsl:value-of select="translate(.,' ','T')"/></dcterms:date>
	</xsl:template>
	
	<xsl:template match="thumbnail_large">	
		<art:thumbnail rdf:resource="{.}"></art:thumbnail>
	</xsl:template>	
	
	<xsl:template match="tags">	
		<!-- add a trailing comma to list -->
		<xsl:variable name="tag_list" select="concat(.,',')" /> 
    	<!-- write a node for each element in the list -->
		 <xsl:call-template name="output-tokens">
      		<xsl:with-param name="list" select="$tag_list" />
      		<xsl:with-param name="delineator" select="','" />
    	</xsl:call-template>
	</xsl:template>  	      
       
    <!-- http://stackoverflow.com/questions/136500/does-xslt-have-a-split-function -->   
	<xsl:template name="output-tokens">
    	<xsl:param name="list" /> 
    	<xsl:param name="delineator" />
    	<xsl:variable name="newlist" select="normalize-space($list)" /> 
    	<xsl:variable name="first" select="substring-before($newlist, $delineator)" /> 
    	<xsl:variable name="remaining" select="substring-after($newlist, $delineator)" /> 
    	<dc:subject>
        	<xsl:value-of select="$first" /> 
    	</dc:subject>
    	<xsl:if test="$remaining">
        	<xsl:call-template name="output-tokens">
                <xsl:with-param name="list" select="$remaining" /> 
                <xsl:with-param name="delineator" select="','" />
        	</xsl:call-template>
    	</xsl:if>
	</xsl:template>       
                
</xsl:stylesheet>                