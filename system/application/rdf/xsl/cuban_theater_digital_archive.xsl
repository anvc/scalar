<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
				xmlns:base="http://example.com/"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" 
                xmlns:scalar="http://vectorsdev.usc.edu/scalar/elements/1.0/"
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:dcterms="http://purl.org/dc/terms/"
                xmlns:art="http://simile.mit.edu/2003/10/ontologies/artstor#"
                xmlns:sioc="http://rdfs.org/sioc/ns#">  
                            
    <!-- PLAY! import XSL version 1.0 by Craig Dietrich -->                        
      
   	<xsl:variable name="archiveName">
		<xsl:text>Cuban Theater Digital Archive</xsl:text>
	</xsl:variable>    
  
  	<!-- Templates -->    
                            
	<xsl:template match="/">
		<rdf:RDF>
			<xsl:apply-templates select="//node/node" />
		</rdf:RDF>		
	</xsl:template>  

	<xsl:template match="*"></xsl:template>
	
	<xsl:template match="//node/node">	
		<rdf:Description rdf:about="{Url}">
			<dcterms:title><xsl:value-of select="title" /></dcterms:title>	
			<dcterms:description><xsl:value-of select="summary" /><xsl:text> </xsl:text><xsl:value-of select="notes" /></dcterms:description>
			<dcterms:source><xsl:value-of select="$archiveName"/><xsl:text>, </xsl:text><xsl:value-of select="collection"/></dcterms:source>
			<dcterms:type><xsl:value-of select="objectType"/></dcterms:type>
			<dcterms:type><xsl:valuf-of select="physicalObjectType"/></dcterms:type>		
			<art:filename rdf:resource="{Url}"></art:filename>	
			<art:sourceLocation><xsl:value-of select="physicalObjectLocation"/></art:sourceLocation>		
			<dcterms:date><xsl:value-of select="physicalObjectDate"/></dcterms:date>
			<dcterms:creator><xsl:value-of select="objectCreatorName"/></dcterms:creator>	
		</rdf:Description>			
	</xsl:template>
                
</xsl:stylesheet>                