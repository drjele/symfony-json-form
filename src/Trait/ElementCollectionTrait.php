<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Trait;

use Drjele\Symfony\JsonForm\Element\Contract\AbstractElement;
use Drjele\Symfony\JsonForm\Exception\Exception;

trait ElementCollectionTrait
{
    /** @var AbstractElement[] */
    private array $elements = [];

    public function addElement(AbstractElement $element): self
    {
        if (true === isset($this->elements[$element->getName()])) {
            throw new Exception(\sprintf('duplicate element name `%s`', $element->getName()));
        }

        $this->elements[$element->getName()] = $element;

        return $this;
    }

    private function renderElements(array $value): array
    {
        $elements = [];

        foreach ($this->elements as $element) {
            $elements[$element->getName()] = $element->render($value[$element->getName()] ?? null);
        }

        return $elements;
    }
}
